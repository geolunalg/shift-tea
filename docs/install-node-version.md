<div style="position: fixed; top: 10px; right: 10px;">
  <a href="../README.md">Home</a>
</div>

# Install Node.js
These steps will install the version of Node.js that the project is currently using. You must have NVM installed to complete this. If you haven't installed it yet, please visit [Install Node.js](docs/install-node-version.md) before you continue.

The current version of Node.js for this project is listed in the `.nvmrc` file, located in the project's root directory.

> Run all of the following commands from the root of the project.

Install Node.js:

```
nvm install
```

Instruct NVM to use the Node.js version defined in the .nvmrc file by running:

```
nvm use
```

Verify the node version:

```
node --version
```

The version displayed should match the version in `.nvmrc`.