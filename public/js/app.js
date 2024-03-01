import {get} from "./modules/get.js"


class VCRDemoApp {
    constructor() {
        this.apikey = false
        this.sessionId = false
        this.token = false

        this.init()

    }

    init(){
        // Do we already have a token stored in the browser store
        let videoCredentials = localStorage.getItem('videoCredentials')
        console.log(videoCredentials)

        if(typeof(videoCredentials) === 'undefined' ||
           videoCredentials == null){
            // No credentials are stored
            // Let's get some
            this.requestPhoneNumber()
        } else {
            videoCredentials = JSON.parse(videoCredentials)
            console.log(videoCredentials)
            if(typeof(videoCredentials.token) === 'string'){
                this.connectVideo(videoCredentials.apiKey,
                                videoCredentials.sessionId,
                                videoCredentials.token
                                )
            }
        }

        

        // setup button response listeners
        document.getElementById('submitphonenumber')
        .addEventListener('click',(event)=>{
            let phoneNumber = document.getElementById('phonenumber').value
            localStorage.setItem('phoneNumber', phoneNumber)
            this.verifyPhoneNumber(phoneNumber)
            // then hide the form
            document.getElementById('enternumber').classList.remove('show')
            // then show the enter code form
            document.getElementById('entercode').classList.add('show')
        })
    }

    requestPhoneNumber(){
        // Let's show the request phone number form
        // It's in the html but hidden in CSS.
        console.log("requesting user phone number")
        document.getElementById('enternumber').classList.add('show')
    }

    verifyPhoneNumber(number) {
        get(`/verify/${number}`)
        .then((result=>{
            console.log(JSON.parse(result))
            let id = JSON.parse(result).request_id
            document.getElementById('submitcode')
            .addEventListener('click',(event)=>{
                let code = document.getElementById('authcode').value
                this.submitAuthCode(id, code)
            })
        }))
    }

    submitAuthCode(id, code){
        console.log(id, code)
        get(`/confirm/${id}/${code}`)
        .then((result)=>{
            result = JSON.parse(result)
            console.log(result)
            if(typeof(result.token)==='string'){
                localStorage.setItem('videoCredentials', JSON.stringify(result))
                this.connectVideo(result.apiKey, result.sessionId, result.token)
                document.getElementById('entercode').classList.remove('show')
                document.getElementById('videoconference').classList.add('show')
            } else {
                console.log("No token found")
            }

        })
    }

    connectVideo(apiKey, sessionId, token){
        console.log(apiKey, sessionId, token)
        document.getElementById('enternumber').classList.remove('show')
        document.getElementById('entercode').classList.remove('show')
        document.getElementById('videoconference').classList.add('show')
        
        const session = OT.initSession(apiKey, sessionId);

        // Subscribe to a newly created stream
        session.on('streamCreated', (event) => {
            const subscriberOptions = {
                insertMode: 'append'
            };
            session.subscribe(event.stream, 'subscribers', subscriberOptions, (err)=>{console.log(err)});
        });

        session.on('sessionDisconnected', (event) => {
            console.log('You were disconnected from the session.', event.reason);
        });
        
        session.on("streamDestroyed", (event)=>{
            if (event.reason === "clientDisconnected") {
            console.log("Call disconnected by the user");
            }            
        })

        // initialize the publisher
        const publisherOptions = {
            insertMode: 'append',
            width: "100%",
            height: "100%"
        };

        const publisher = OT.initPublisher('publisher', publisherOptions, (err)=>{console.log(err)})

        // Connect to the session
        session.connect(token, (error) => {
            if (error) {
                console.log(error)
            } else {
                // If the connection is successful, publish the publisher to the session
                session.publish(publisher, (err)=>{console.log(err)});
            }
        })

        document.getElementById('forgetme').addEventListener('click',(event)=>{
            localStorage.clear()
            window.location.href = '/'
        })
    }
}

const vcrDemoApp = new VCRDemoApp()

export {vcrDemoApp}