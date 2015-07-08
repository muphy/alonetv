####edit 
```
vi /etc/init/yourprogram.conf
```
####script
	description "npm start"
	author      "muphy"
	
	# used to be: start on startup
	# until we found some mounts weren't ready yet while booting:
	start on started mountall
	stop on shutdown
	
	# Automatically Respawn:
	respawn
	respawn limit 99 5
	
	script
	    # Not sure why $HOME is needed, but we found that it is:
	    export HOME="/root"
	    cd /root/server/alonetv
	    exec /usr/local/bin/npm start >> /var/log/node.log 2>&1
	end script
	
	post-start script
	   # Optionally put a script here that will notifiy you node has (re)started
	   # /root/bin/hoptoad.sh "node.js has started!"
	end script
	
```
	start paul
```

```
	stop paul
```