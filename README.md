# Note

Repo ini bertujuan untuk memberikan sedikit demonstrasi ataupun gambaran sederhana pada case multi container aplikasi, yg bisa diachive dengan mejalankan container satu demi satu secara manual, maupun dengan menggunakan docker compose

aplikasi sederhana ini terdiri dari 3 komponen yaitu:
1. express app yg running on top of nodejs
2. mongodb sebagai storage
3. redis sebagai cache

### Cara Manual
cara ini dilakukan dengan menjalankan setiap container dengan command `docker run --name [container_name] [image_name]`

langkah-langkah:
1. build express app dengan menjalankan `docker build` pada Dockerfile yg ada
command lengkapnya yaitu `docker build --tag demo-app:1.0 .` , jadi kita membuat suatu image dengan nama demo-app:1.0 dari Dockerfile yg ada
2. jalankan container semua container
```
    docker run -d --name demo-app -p 3000:3000 demo-app:1.0
    docker run -d --name mongodb -p 27017:27017 mongo
    docker run -d --name redis6 -p 6379:6379 redis:6.2
```
ketika semua container telah running, aplikasi masih belum bisa berjalan karena pada dasarnya container itu tersisolasi sehingga express app tidak bisa terkoneksi pada mongodb dan redis. terus gimana? ya bikin mereka berada dalam satu network
3. buat network baru
```
    # buat network
    docker network create app-network

    # check list network
    docker network ls
```
4. hubungkan semua container tadi pada network yg baru dibuat dg command `docker network connect [network_name] [container_name]`
```
    docker network connect app-network demo-app
    docker network connect app-network mongodb
    docker network connect app-network redis6
```
5. pastikan semua container telah terkonek dg network yg baru dibuat
```
    docker network inspect app-network
```
akan ditampilkan semua container yg terkoneksi dengan network `app-network`
6. nah langkah terakhir yaitu dengan menyesuaikan hostname db pada express app, jika koneksinya dari lokal maka hostnamenya adalah `localhost` atau `127.0.0.1`, nah kalo koneksinya dari container dalam satu network hostnamenya dapat dilihat dengan menginspect container tersebut dengan command `docker container inspect [container_name]` 
```
    # check hostname untuk mongodb
    docker container inspect mongodb

    # check hostname untuk redis
    docker container inspect redis6
```
hostname dapat dilihat pada `Networks.[network_name].DNSNames`

### Cara Otomatis
cara ini lebih EZ, yaitu dengan menjalankan command `docker-compose up`, abis tu ubah hostname untuk mongodb dan redis di file `.env` dengan nama service yg tertera pada file `docker-compose.yml`. DONE! ezet kan

thats it, happy coding

