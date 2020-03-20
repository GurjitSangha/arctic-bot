function sendMessage() {
    const msg = document.getElementById('message').value

    let xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/message', true)
    xhttp.setRequestHeader('Content-type', 'application/json')
    xhttp.send(JSON.stringify({message: msg}))
}

function sendReaction() {
    const emoji = document.getElementById('emoji').value

    let xhttp = new XMLHttpRequest()
    xhttp.open('POST', '/react', true)
    xhttp.setRequestHeader('Content-type', 'application/json')
    xhttp.send(JSON.stringify({emoji}))
}