import titlePng from "@/assets/images/login-title.png";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {login} from "@/hooks/manage-system/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {client} from "@/hooks/bicycles/api.ts";

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
  const {toast} = useToast();
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
    localStorage.setItem("username", values.username);
    setUser(values);
    navigate("/street");
    await client.get("fpInfoTemplates/saveUserList");
  };

  return (
    <Form {...form}>
      <form className={"w-full h-full bg-login relative"} onSubmit={form.handleSubmit(onSubmit)}>
        <div className={"absolute right-[286px] top-[205px] space-y-8 flex flex-col justify-center items-center"}>
          <img src={titlePng} alt=""/>
          <div className={"bg-login-module w-[475px] h-[580px] bg-no-repeat"}>
            <div className={"text-center py-[48px] text-[26px]"}>用户登录</div>
            <div className={"px-10 space-y-8"}>
              <FormField
                control={form.control}
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} className={"text-black"} placeholder="请输入用户名"/>
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
                      <Input {...field} className={"text-black"} placeholder="请输入密码" type={"password"}/>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                name={"password"}
              />
            </div>
            <div className={"text-white text-center py-[84px] px-10"}>
              <Button
                type={"submit"}
                size={"lg"}
                className={"w-full bg-[#3DCAFF] hover:bg-[#3DCAFF] text-[22px] py-[12px]"}>登录</Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Login;

