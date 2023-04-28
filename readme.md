
# Some helpfull commands
## How to run
```sh
npx expo start --tunnel
```

## Install
```sh
nvm install --lts
npm install -g yarn
yarn
```

## Upgrade
```sh
yarn upgrade-interactive
or
yarn upgrade --latest
```

## Build
```sh
yarn add eas-cli
npx eas-cli login
npx eas-cli build --platform android
```

## Upgrade gradle
```sh
cd android
 ./gradlew wrapper --gradle-version 8.0
```