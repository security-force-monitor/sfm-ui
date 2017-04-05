# Security Force Monitor

## Installing the development kit

You will need a 64bit Linux machine with a C compiler installed and
the `python-dev` package (python2.7), as well as the
`curl` utility.

To install the kit, run

```
cd ~
curl https://ffctn.com/a/ff-kit/install | sh
```

then follow the instructions, which would lead to running

```
source ~/FF-Kit/bin/env.sh
```

If you type `sugar --help` and get a list of options, then it means
that the kit is properly installed.

# Running the application

Running the application and building it requires the development kit,
`git` and `make` (as well as possibly other commands, but they should all standard or
included in the kit).

```
make run               # Runs the application on port 8000
make run PORT=8001     # Runs the application on port 8001
make dist              # Builds distribution files for the application
```
