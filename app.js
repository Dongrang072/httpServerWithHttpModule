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




const httpRequestListener = function (request, response) {
    const { url, method } = request;
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
            response.end(JSON.stringify({ contents: contents }));

        } else if (url === '/user_posting') { // /list로 url이 시작 되는 경우  
            let body = '';
            request.on("data", (data) => {
                body += data;
            });

            request.on('end', () => {
                const userInfo = JSON.parse(body);
                const user = users.find((user) => user.id === userInfo.userId); //userId와의 값이 일치하는 id 키값을 갖고 있는 users 내의 객체를 user에 저장 

                if (user) { //user가 undefined가 아닌 경우, 즉 userId에 undefined로 반환되는 경우 
                    const postings = posts
                        .filter((post) => post.userId === user.id) //유저 아이디값이 일치하는 경우에
                        .map((post) => ({  // posting[]{} => 객체를 원소로 갖는 배열 posting 
                            postingId: post.id,
                            postingName: post.title,
                            postingContent: post.description
                        }));

                    postings.map(posting => console.log(posting)); //출력 확인
                    //console.log(postings.length); // 1

                    response.writeHead(200, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({
                        data: {
                            userId: user.id,
                            userName: user.name,
                            postings: postings // 개시글이 여러개라도 문자열 형태로 출력해줌 
                        }
                    }));
                } else { //user가 undefined 인 경우 
                    response.writeHead(404, { "Content-Type": "application/json" }); //404 not found
                    response.end(JSON.stringify({ message: 'could not find lists' }));

                }
            });
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


        } else if (url === '/posts') { //url이 posts로 들어가는 경우 
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
                const user = users.find(user => user.id === patchData.userId && user.password === patchData.userPwd); //
                for (let i = 0; i < users.length; i++) {
                    console.log(users[i])
                }

                if (user) { //user가 참일 경우, 즉 사용자가 인증이 될 경우, 일치하지 않을 경우 undefined로 표시되고 에러메세지로 감 


                    //user 가 존재하지만 postId가 없을 경우 (그 글을 쓴 적이 없을 경우 )    
                    const post = posts.find((post) => post.id === patchData.postingId);

                    //이 사람이 가진 글 번호랑 조회를 해야함

                    if (post) {
                        // 입력 정보를 이용해  posts 배열 수정
                        for (let i = 0; i < posts.length; i++) { //
                            if (posts[i].id === patchData.postingId) {
                                posts[i].title = patchData.postingTitle; //그 사람이 쓴 글이 여러개일 수도 있으니 이 조건도 만족해야함. 
                                posts[i].description = patchData.postingContent;
                                break; //위 세 조건이 모두 실행될 경우 조건이 만족되는 요소는 하나밖에 없으니 바로 빠져나옴 
                            }
                        }
                        const result = []; //결과물을 담을 배열, 첫번째 요소에 출력값이 들어갈것임 

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

                    } else { //post undefined, find함수에서 저장된 값이 없어서 찾지 못한 경우 
                        response.writeHead(401, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'patchFailed, could not find post' }));
                    }

                } else { //유저 아이디와 비밀번호가 일치하지 않는 경우 
                    response.writeHead(401, { 'Content-Type': 'application/json' });
                    //401은 서버가 클라이언트 요청에 대한 인증을 거부했음을 나타내는 HTTP 상태 코드 중 하나입니다. 보통 사용자가 로그인하지 않은 경우나 인증 정보가 잘못된 경우에 사용됩니다.
                    response.end(JSON.stringify({ message: 'patchFailed, could not find user' }));
                }
            });

        } else { // PATCH 메서드로 url을 요청하였는데 잘못 입력한 경우 
            response.writeHead(404, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: 'patchFailed' }));
        }
    } else if (method === 'DELETE') {

        if (url == '/delete') { //다 지우는 경우 
            let body = "";
            request.on("data", (data) => {
                body += data;
            });
            request.on('end', () => {
                const user = JSON.parse(body); //입력된 값 

                // user.id와 user.password가 일치하는 user[]의 인덱스를 찾음
                const userIndex = users.findIndex((u) => u.id === user.id && u.password === user.password); //입력된값의 아이디와 비밀번호가 일치하는 유저 찾기
                if (userIndex === -1) { // user가 없는 경우( find함수에 의해 userIndex의 값은 -1) 즉 아이디와 비번이 일치하지 않는 경우,  404 Not Found 응답 반환
                    response.writeHead(404, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: 'delete failed' }));
                    return;
                }

                // posts[] 내에서 userId가 user.id와 일치하는 객체들을 찾아 삭제
                let deletedCount = 0; // 삭제된 post의 갯수 
                for (let i = 0; i < posts.length; i++) { // posts 배열 내에서 찾기 
                    if (posts[i].userId === user.id) { //위 조건에서 찾은 user의 아이디와 일치하는 경우 
                        posts.splice(i, 1); //index=i 인 경우의 요소를 posts에서 삭제 
                        deletedCount++; // 조건문이 실행된 경우 값이 증가 
                    }
                }

                if (deletedCount > 0) { // posts[]에서 객체를 삭제한 경우, 하나 이상 삭제된 경우 deletedCount의 갯수가 최소 1 이상, 삭제되었다고 메세지 띄우기 
                    response.writeHead(200, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: ` posts deleted` }));
                } else { // posts[]에서 객체를 삭제하지 않은 경우 404 Not Found 응답 반환
                    response.writeHead(404, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: 'delete failed' }));
                }
            });
        } else if (url === '/deleteSpecific') { // 특정 유저의 특정 게시글만 삭제하고 싶은 경우 
            let body = "";
            request.on("data", (data) => {
                body += data;
            });
            request.on('end', () => {
                const user = JSON.parse(body); //입력된 값 

                // user.id와 user.password가 일치하는 user[]의 인덱스를 찾음
                const userIndex = users.findIndex((u) => u.id === user.id && u.password === user.password); //입력된값의 아이디와 비밀번호가 일치하는 유저 찾기
                if (userIndex === -1) { // user가 없는 경우( find함수에 의해 userIndex의 값은 -1) 즉 아이디와 비번이 일치하지 않는 경우,  404 Not Found 응답 반환
                    response.writeHead(404, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: 'delete failed' }));
                    return;
                }

                // posts[] 내에서 userId가 user.id와 일치하는 객체들을 찾아 삭제
                let remove_count = 0;

                for (let i = 0; i < posts.length; i++) { // posts 배열 내에서 찾기 
                    if (posts[i].userId === user.id) { //위 조건에서 찾은 user의 아이디와 일치하는 경우 
                        remove_count++;
                    }
                }
                // 아무것도 없을 경우 remove_count =0 
                if (remove_count === 0) {
                    response.writeHead(404, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: 'delete failed' }));
                } else {
                    const remove_index = posts.findIndex((u) => u.id === user.postingId)
                    posts.splice(remove_index,1);

                    response.writeHead(200, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: ` posts deleted` }));
                }
            });


        } else {
            response.writeHead(404, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: 'delete failed' }));
        }
    }


}
server.on("request", function (request, response) {
    httpRequestListener(request, response);
});



server.listen(8000, '127.0.0.1', function () {  //8000 포트 요구 항상 대기중.....
    console.log('Listening to requests on port 8000');
});