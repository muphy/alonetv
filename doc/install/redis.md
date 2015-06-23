#### 설치	
```sh
$ sudo add-apt-repository -y ppa:rwky/redis
$ sudo apt-get update
```
##### 만약 sudo add-apt-repository -y ppa:rwky/redis 단계에서 에러가 난다
 
```sh
$ sudo apt-get install python-software-properties
```

####client 로 확인 해보기
	$ src/redis-cli
	redis> set foo bar
	OK
	redis> get foo
	"bar"
	
[redis cheat-sheet]	
[redis cheat-sheet]: http://lzone.de/cheat-sheet/Redis