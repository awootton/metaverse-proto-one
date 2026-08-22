#!/bin/bash

# run this is a terminal window
# it will build the project, copy it to gotohere-static-react-build/ in the knotfreeiot project (later maybe)
# because, for now, we embed these static assets in the knotfree container. 

yarn build

# done by knotoperator/apply_namespace.go  sync -a ./build/ ../knotfreeiot/docs/   

# this would be better but it is not working - but I'm not giving up.
aws s3 cp ./build s3://gotoherestatic/gotohere.com/ --recursive


