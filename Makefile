.PHONY: install build

install:
	cd src/golang && gb vendor restore
	cd src/browser && npm install && bower install

ember:
	cd src/browser && ember serve
