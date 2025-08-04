<div style="position: fixed; top: 10px; right: 10px;">
  <a href="../README.md">Home</a>
</div>

# Install Node Version Manager (NVM)
Run one of the following two commands to install NVM:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
or 

```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Run the following command to set the $PROFILE environment variable to your profile file's path:

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Verify that the installation was successful:

```
nvm --version
```

You will need NVM to install the version of Node.js that the project is currently using. For additional assistance, you can visit the official NVM website.

- [NVM](https://github.com/nvm-sh/nvm)
