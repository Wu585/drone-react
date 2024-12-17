# 使用本脚本前需将本地ssh的pub公钥复制到服务器的authorized_keys文件下
# 确保服务器打开sshd服务，powershell管理员身份打开：Start-Service sshd

user=cjxt
ip=36.152.38.220
dist=dist.tar
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
scp $dist $user@$ip:E:\wqy\

ssh $user@$ip "powershell -Command E:;cd E:\wqy\;cp dist.tar E:\wqy\shuzijiayuan-nginx\nginx-1.24.0\html;cd E:\wqy\shuzijiayuan-nginx\nginx-1.24.0\html;tar -xvf $dist;ls"
title '上传成功'


