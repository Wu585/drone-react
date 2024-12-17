user=root
ip=36.139.117.52
dist=dist.tar
password=Yxhk@3686
current_dir=$(dirname $0)

function title {
  echo
  echo "###############################################################################"
  echo "## $1"
  echo "###############################################################################"
  echo
}

title '打包'
rm -rf dist
npm run build
cd dist
tar -cvf $dist .

title '上传'
scp $dist $user@$ip:/etc/nginx/html/ffjd
ssh $user@$ip "tar -xvf /etc/nginx/html/ffjd/$dist"

