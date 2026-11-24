# Little Big Gallery

A shared drawing gallery with separate pages. Keep `/` open on the forest display and share `/draw` with participants. Each person can draw independently; a submission appears in the forest for everyone.

The main display is a wordless woodland scene where drawings drift around the screen. New drawings use transparent backgrounds so their marks blend into the environment.

## Run it

1. In this folder, run `npm install`.
2. Run `npm start`.
3. Open `http://localhost:3000` on the main display.
4. On phones connected to the same Wi-Fi, open `http://<computer-ip>:3000/draw`.

To find this computer's local IP on Windows, run `ipconfig` and use the IPv4 Address for the active Wi-Fi network. If Windows Firewall prompts you, allow Node.js on your private network.

Drawings are shared live and kept in server memory, up to 200 at a time. They are cleared when the server stops.
