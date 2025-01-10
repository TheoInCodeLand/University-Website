function sendMail() {
    let parms = {
        std_name: "Hello"
    };
    emailjs.send("service_bko9mof", "template_acmlb2f", parms);
    
}