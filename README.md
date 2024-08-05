# AllCloud

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.4.

## Install project locally

1. On your "AllCloud" folder open terminal and Run `git init` following by `git pull https://github.com/Cipriangr/AllCloud.git`
2. On main folder, Run `npm install`.
3. Go to /server folder and run `npm install` and `node database.js` to initialize the database

## Starting the project with Service Worker (Online and Offline mode)

1. Go to server folder and start the server by running in terminal `node server.js`. Wait for "Connected to the database" message in terminal. It will run on port 3000, go to `http://localhost:3000/users` to check everything is fine (it should be an empty array if you didn't add any contacts yet). Close this terminal only when you want to close the server.
2. Open another terminal, go to main folder and run `ng build`. Wait the build to finish and check if dist folder was created. Run `npx http-server -p 8080 -c-1 dist/all-cloud/browser` or change the path if is different. You might notice message: `Need to install the following packages: http-server@14.1.1`. Type `y` and wait to be installed. When text `Starting up http-server, serving dist/all-cloud/browser...` is displayed, the project is online and can be tested on `http://localhost:8080/`.
3. I recommend to use incognito. Add some contacts by pressing "Add Random Records" and hit refresh button one or 2 times so the data is cached.
4. Right click and go to Inspect -> Application -> Service Workers (Above Storage category) and check if service worker `http://localhost:8080` is registered.
5. Features: Add 10 contacts, Details about specific contacts, edit contact, delete contact and add New Contact are available.
6. Simulate offline mode by checking Offline checkbox in Application - Service Worker or Network - Pressets Offline.
7. Offline requests should be added and removed (when back online) in IndexedDB-RequestQueue-requests

## Starting the project online mode only

Run `ng serve` on main folder. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Contact

Feel free to contact me on cipriangrumazescu97@gmail.com for questions.
