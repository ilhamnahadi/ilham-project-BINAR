const http = require('http')
const PORT = 9000;

const app = http.createServer(function (request, response) {
    if (request.url === '/home') {
        response.writeHead(200, { "content-type": 'text/html'})
        response.write("<h> saya ILHAM </h>");
        response.write("<h1> saya ILHAM </h1>");
        response.write("<i> saya ILHAM </i>");
    } else if (request.url === '/product') {
        response.write("This is product");
    } else if (request.url === '/student') {
        response.writeHead(200, { "content-type": 'application/json'})
        response.write(JSON.stringify({ nama: "ILHAM" }))
    } else if (request.url === '/json') {
        response.writeHead(500, {});
        response.write("Server Error !");
    }
    else {
        response.writeHead(404, {});
        response.write("Not found !");
    }
    response.end()
});

app.listen(PORT).on("listening", function () {
    console.log(`Server berjalan di localhost:${PORT}`)
});