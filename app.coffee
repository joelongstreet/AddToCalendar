express     = require 'express'
email       = require 'nodemailer'
fs          = require 'fs'
url         = require 'url'
app         = express()
port        = process.env.PORT || 3001
env         = process.env.NODE_ENV || 'development'

app.use express.bodyParser()

transport   = email.createTransport('SMTP',
    service : 'Gmail'
    auth    :
        user    : process.env.GOOGLE_USER
        pass    : process.env.GOOGLE_PASS
)


# POST is expecting an object that looks
# something like : 
# {
#   email       : "email@email.com"
#   schedule    : {
#       "start_time"    : 20121010T070000
#       "end_time"      : 20121010T140000
#       "description"   : "..."
#       "location"      : "..."
#       "summary"       : "..."
#   }
# }

app.post '/', (req, res) ->
    
    files = []

    res.send({'complete' : true})

    for item in req.body.schedule

        create_file _i, item, (file_path, index) ->

            files.push
                filePath : file_path

            if files.length == req.body.schedule.length
                send_mail(files, req.body.email)



create_file = (index, options, next) ->

    if !options.description then options.description = 'Workday'
    if !options.summary then options.summary = 'Summary'
    if !options.location then options.location = 'Work'

    content = "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nMETHOD:REQUEST\nSTATUS:CONFIRMED\nBEGIN:VEVENT\nDTSTART:#{options.start_time}\nDTEND:#{options.end_time}\nDESCRIPTION:#{options.description}\nLOCATION:#{options.location}\nSUMMARY:#{options.summary}\nEND:VEVENT\nEND:VCALENDAR"
    date    = new Date().getTime()
    file    = "#{index}_#{date}.ics"
    path    = "#{__dirname}/tmp/#{file}"

    fs.writeFile path, content, (err) ->
        if err then console.log err
        else next(path, index)



send_mail = (calendar_events, email) ->

    options         =
        from        : 'Joe Longstreet <joelongstreet@gmail.com>'
        to          : email
        subject     : 'Work Schedule'
        text        : 'Have a good day at work honey!\nLove, \nHusband'
        html        : 'Have a good day at work honey!\nLove, \nHusband'
        attachments : calendar_events


    transport.sendMail options, (err, response) ->
        if err then console.log err
        else
            console.log 'message sent'
            for event in calendar_events
                fs.unlink event.filePath, (err) ->
                    if err then console.log err
                    else console.log 'file deleted'


console.log "listening on #{port} in #{env} environment"
app.listen port
