# Hello Docker
## Setup
In the root directory, run in the terminal

```
docker-compose build
docker-compose up
```

You may need to pull additional docker images

To open the website or access the API, run in the terminal (where default is the name of your docker machine)

```
open "http://$(docker-machine ip default)"
```
