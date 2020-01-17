function sendMessage() {
    let msg = document.getElementById('message').value

    let xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/message', true)
    xhttp.setRequestHeader('Content-type', 'application/json')
    xhttp.send(JSON.stringify({message: msg}))
}