import axios from "axios";

const Test = () => {
  const onPay = () => {
    const str = "dad4axxxdde411xxzzdb3211223xadf2225";
    console.log("str");
    console.log(str);
    axios.post("test/alipay/pay", {
      "out_trade_no": str,
      "subject": "车",
      "total_amount": "1.00",
      "body": str,
      // "emp_code": "xxx1111",
      // "company_type": "company_type",
      "park_phone": "13112345678",
      "login_name": "xxxx"
    }).then(res => {
      console.log("res");
      console.log(res);
      window.location.href = res.data.msg;
      /*if (res.status === 200) {
        //支付宝支付
        // 添加之前先删除一下，如果单页面，页面不刷新，添加进去的内容会一直保留在页面中，二次调用form表单会出错
        let divForm = document.getElementsByTagName("divform");
        if (divForm.length) {
          document.body.removeChild(divForm[0]);
        }
        const div = document.createElement("divform");
        div.innerHTML = res.data; // data就是接口返回的form 表单字符串
        document.body.appendChild(div);
        document.forms[0].setAttribute("target", "_blank"); // 新开窗口跳转
        document.forms[0].submit();
      }*/
    });
  };

  return (
    <div className={"text-black"}>
      <button onClick={onPay}>支付</button>
    </div>
  );
};

export default Test;

