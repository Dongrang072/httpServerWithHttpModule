// app.js
const http = require('http'); // (1)
const server = http.createServer();


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

const posts = [ //view object이니 데이터베이스에 저장 할 필요 없는 contents
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
] //유저에 대한 접근은 하나만 되어야함, userId === userId 유저마다 각각 컨

//posts[i].title , posts[i].description



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
        else if (url === "/posts") {
            //vo 함수
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ posts: posts }));
        }
        else if (url === "/patch") {
            // [Get] 127.0.0.1:8080/patch
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ posts: logins }));
        }
        else if (url === "/contents") { //3번 과제 유저 id마다 user_id 키값이 일치하는 posts를 찾은 경우, 키값을 새로 변조해서 contents[]에 값 저장 

            const contents = [] //선언 위치는 중요함 .. 이건 저장을 할 필요가 없다 
            // 게시글(posts) 매칭 후 새로운 배열(contents)에 저장하는 펑션

            for (let i = 0; i < users.length; i++) {
                for (let j = 0; j < posts.length; j++) {
                    if (users[i].id === posts[j].userId) {

                        console.log(users, posts, 123123123)
                        contents.push({
                            userId: users[i].id,
                            usersName: users[i].name,
                            postingId: posts[j].id,
                            postingTitle: posts[j].title,
                            postingContent: posts[j].description
                        })
                    }
                }
            }


            response.writeHead(200, { "Content-Type": "application/json" });
            console.log("==========================")
            console.log(contents)
            console.log("==========================")
            response.end(JSON.stringify({ contents: contents }));

        } 

    } else if (method === 'POST') { // (3)
        if (url === '/users') {
            let body = ''; // (4)

            request.on('data', (data) => { body += data }) // (5)

            // stream을 전부 받아온 이후에 실행
            request.on('end', () => {
                const usersArray = JSON.parse(body);
                usersArray.forEach(user => {
                    users.push({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password
                    });
                });
                response.writeHead(201, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: 'userCreated' }));
            });
        }
        // post 정보를 POST 
        else if (url === '/posts') { //url이 posts로 들어가는 경우 
            let body = ''; // (4)
            request.on('data', (data) => { body += data }) //데이터를 합쳐주는 과정 stream
            // stream을 전부 받아온 이후에 실행
            request.on('end', () => {
                const postsArray = JSON.parse(body);
                postsArray.forEach(post => {
                    posts.push({
                        id: post.id,
                        title: post.title,
                        description: post.description,
                        userId: post.userId
                    });
                });
                response.writeHead(201, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: 'postCreated' }));
            });

        }


    } else if (method === 'PATCH') { //put patch 
        if (url === '/patch') {
            let body = '';

            request.on('data', (data) => { body += data })

            request.on('end', () => {
                const patchData = JSON.parse(body);
                console.log(patchData)
                const user = users.find(user => user.id === patchData.userId && user.password === patchData.userPwd); //map 
                for (let i = 0; i < users.length; i++) {
                    console.log(users[i])
                }
                console.log("==============")
                console.log(user);  //undefined ????
                console.log("==============")
                if (user) { //user가 참일 경우, 즉 사용자가 인증이 될 경우 

                    //이 사람이 가진 글 번호랑 조회를 해야함

                    // 입력 정보를 이용해  posts 배열 수정
                    for (let i = 0; i < posts.length; i++) { //
                        if (posts[i].id === patchData.postingId) {
                            posts[i].title = patchData.postingTitle;
                            posts[i].description = patchData.postingContent;

                            break;
                        }
                    }
                    const result = [];

                    for (let i = 0; i < users.length; i++) {
                        for (let j = 0; j < posts.length; j++) {
                            if (users[i].id === posts[j].userId) {
                                const content = {
                                    userId: users[i].id,
                                    usersName: users[i].name,
                                    postingId: posts[j].id,
                                    postingTitle: posts[j].title,
                                    postingContent: posts[j].description,
                                };
                                result.push(content);
                            }
                        }
                    }
                    const result_object = result[0];
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ data: result_object }));
                } else {
                    response.writeHead(401, { 'Content-Type': 'application/json' }); //유저 아이디와 비밀번호가 일치하지 않는 경우 
                    response.end(JSON.stringify({ message: 'failed' }));
                }
            });

        }
    }


}



server.on("request", function (request, response) {
    httpRequestListener(request, response);

});



server.listen(8000, '127.0.0.1', function () {  //8000 포트 요구 항상 대기중.....
    console.log('Listening to requests on port 8000');
});


