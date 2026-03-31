# Kahoot (Temu version)

## Installing the dependencies

```sh
npm install --legacy-peer-deps
```

### Android build dependencies

If you are a good boy and use NixOS it's easy, otherwise good luck soldier.

## Running on android

Make sure to first setup an ADB device (`adb devices`)

```sh
npx cap run android
```

## Building for Android

### Create a keystore

Do not commit lolz

```sh
# Remember the password
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
```

### Build the app

```sh
npx cap build android \
  --keystorepath $PWD/my-release-key.jks \
  --keystorepass "$YOUR_KEYSTORE_PASSWORD" \
  --keystorealias my-alias \
  --keystorealiaspass "$YOUR_KEYSTORE_PASSWORD" \
  --androidreleasetype APK \
  --signing-type apksigner
```

And install the signed version I guess
