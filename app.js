// app.js
const http = require('http'); // (1)
const server = http.createServer();

// GET /users 핸들러 함수
const getUserHandler = function (request, response) {
  if (request.method === "GET" && request.url === "/users") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ users: users }));
  }
};

//데이터베이스 역할을 하는 곳 
const users = [ // 회원가입 할 유저들 로그인 
  {
    id: 1,
    name: "Rebekah Johnson",
    email: "Glover12345@gmail.com",
    password: "123qwe",
  },
  {
    id: 2,
    name: "Fabian Predovic",
    email: "Connell29@gmail.com",
    password: "password",
  },
]

const posts = [
  {
    id: 1,
    title: "간단한 HTTP API 개발 시작!",
    description: "Node.js에 내장되어 있는 http 모듈을 사용해서 HTTP server를 구현.",
    userId: 1,
  },
  {
    id: 2,
    title: "HTTP의 특성",
    description: "Request/Response와 Stateless!!",
    userId: 2,
  },
];

const httpRequestListener = function (request, response) {
  const { url, method } = request
  if (method === 'GET') {
    if (url === '/ping') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'pong' }));
    } else if (url === "/users") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ users: users }));
    }
  } else if (method === 'POST') { // (3)
    if (url === '/users') {
      let body = ''; // (4)

      request.on('data', (data) => { body += data }) // (5)

      // stream을 전부 받아온 이후에 실행
      request.on('end', () => {  // (6)
        const user = JSON.parse(body); //(7) 

        users.push({ // (8) 각각 밸류는 프론트에서 받아온걸로 넘김 
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password
        })
        response.writeHead(201, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: 'userCreated' })); // (9)
      })
    }
  }
};

server.on("request", function (request, response) {
  getUserHandler(request, response);
  httpRequestListener(request, response);
});

server.listen(8000, '127.0.0.1', function () {  //8000 포트 요구 항상 대기중.....
  console.log('Listening to requests on port 8000');
});


