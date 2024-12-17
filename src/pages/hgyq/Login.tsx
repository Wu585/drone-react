import {Input} from "@/components/ui/input.tsx";
import {LockKeyhole, User} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {login} from "@/hooks/manage-system/api.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useNavigate} from "react-router-dom";
import {useSceneStore} from "@/store/useSceneStore.ts";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "请输入用户名"
  }),
  password: z.string().min(6, {
    message: "请输入密码"
  }),
});

const Login = () => {
  const navigate = useNavigate();
  const {setUser} = useSceneStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const {succeed} = (await login(values)).data;
    if (!succeed) {
      return toast({
        description: "登录失败，用户名或密码错误！"
      });
    }
    setUser(values);
    localStorage.setItem("username", values.username);
    navigate("/resource-center")
  };

  return (
    <Form {...form}>
      <form className={"h-full border border-yellow-50 content-center"} onSubmit={form.handleSubmit(onSubmit)}>
        <div
          className={"w-[576px] h-[376px] bg-login-panel -translate-y-10 flex flex-col items-center py-[45px] px-[111px]"}>
          <h1 className={"text-[24px] mb-[6px]"}>欢迎登录</h1>
          <h2 className={"mb-[26px]"}>- welcome to login -</h2>
          <div className={"w-full space-y-[16px]"}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <div className={"flex items-center relative"}>
                      <User className={"absolute left-[18px]"}/>
                      <Input {...field} className={"bg-[#0B3B7D] pl-[53px]"} placeholder="请输入用户名"/>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              name={"username"}
            />
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <div className={"flex items-center relative"}>
                      <LockKeyhole className={"absolute left-[18px]"}/>
                      <Input {...field} className={"bg-[#0B3B7D] pl-[53px]"} placeholder="请输入密码"/>
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
              name={"password"}
            />
          </div>
          <Button type={"submit"} style={{
            background: "rgba(11,59,125,0.7)",
            boxShadow: "inset 8px -5px 19px 0px #1283FF, inset 15px 5px 25px 0px #2BA1D7, inset 3px -5px 19px 0px #12B0FF",
            borderRadius: "2px",
            borderImage: "linear-gradient(270deg, rgba(103, 187, 246, 1), rgba(97, 190, 245, 1), rgba(108, 233, 254, 1)) 1 1"
          }} className={"border w-full mt-[30px]"}>登录</Button>
        </div>
      </form>
    </Form>
  );
};

export default Login;

