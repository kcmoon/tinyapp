# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Extra protection of data was implemented throughout, using password hashing, cookie encryption, and thorough permission testing.

## Final Product

!["Screenshot of URLs Page"](https://github.com/kcmoon/tinyapp/blob/main/docs/urls-page.png?raw=true)
!["Screenshot of Logged Out Page"](https://github.com/kcmoon/tinyapp/blob/main/docs/logged-out-page.png?raw=true)
!["Screenshot of Create TinyURL Page"](https://github.com/kcmoon/tinyapp/blob/main/docs/create-new-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Create an account by registering with email and set a password that will be protected using bcrypt.
- Create new short urls by entering long urls on the Create TinyURL page (urls/new).
- Access your own personal database of short and long urls, knowing only you can access them and edit/delete them. 