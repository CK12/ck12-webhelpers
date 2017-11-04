set -x

sudo apt-get install libsvn1 libsvn-dev
if [ ! -d /usr/include/apr-1 ]; then
    sudo ln -s /usr/include/apr-1.0 /usr/include/apr-1
fi

pydist=`python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())"`
pysvn_path=${pydist}/pysvn

if [ ! -f pysvn-1.7.8.tar.gz ]; then
    wget http://pysvn.barrys-emacs.org/source_kits/pysvn-1.7.8.tar.gz
fi
if [ ! -d pysvn-1.7.8 ]; then
    tar -xzf pysvn-1.7.8.tar.gz
fi
cd pysvn-1.7.8

cd Source
python setup.py configure
make
cd ../Tests
make
cd ../Source
if [ -d $pysvn_path ]; then
    sudo mv $pysvn_path ${pysvn_path}_prev
fi
sudo mkdir $pysvn_path
sudo cp pysvn/__init__.py ${pysvn_path}
sudo cp pysvn/_pysvn*.so ${pysvn_path}

cd ..
