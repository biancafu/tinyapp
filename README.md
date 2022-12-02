# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
## Install

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) :

```sh
$ npm install express
```

## Getting Started

- Fnish installing all dependencies.
- Run the development web server using:
```sh
$ node express_server.js
```
- Go to your web browser and register an account using this link: http://localhost:8080/register
- Enjoy adding your own urls and accessing them using shorten ids 😄!

## Files Descriptions
  - tinyApp
    - express_server.js - file consists with all routes of the browser
    - helpers.js - file consists with functions used in express_server.js
- views
  - urls_index.ejs - html template for http://localhost:8080/urls
  - urls_show.ejs - html template for detail url page (access by http://localhost:8080/urls/[shorten id])
  - urls_new.ejs - http://localhost:8080/urls/new
  - urls_register.ejs - html template for http://localhost:8080/register
  - urls_login.ejs - html template for http://localhost:8080/login
- partials
  - _head.ejs - header for all pages
- test
  - helpersTest.js - test file for functions in helpers.js
## Final Product
Register Page should look like this:
!["Register page"](https://github.com/biancafu/tinyapp/blob/master/register%20account.png)
Login Page should look like this:
!["Login page"](https://github.com/biancafu/tinyapp/blob/master/log%20in.png)
Urls (will only show urls if user is logged in):
!["urls page"](https://github.com/biancafu/tinyapp/blob/master/urls%20page.png)
Create new url:
!["new url page"](https://github.com/biancafu/tinyapp/blob/master/adding%20new%20url.png)
Url details:
!["url detail page"](https://github.com/biancafu/tinyapp/blob/master/url%20detail%20page.png)


