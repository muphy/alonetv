
####install guide

##### Shell 실행시 자동으로 PATH 로드하기
```sh
$export PATH="(사용할 경로):$PATH
```
#####trouble shooting
  * problem
   ```
      $ root@test:~# npm -v
      /usr/bin/env: node: No such file or directory
   ```
  * solution
    ```
    $ ln -s /usr/bin/nodejs /usr/bin/node
    ```
