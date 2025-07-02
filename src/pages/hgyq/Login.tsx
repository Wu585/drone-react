import {LockKeyhole, User} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {useAjax} from "@/lib/http.ts";
import {HTTP_PREFIX} from "@/api/manage.ts";
import {ELocalStorageKey, EUserType} from "@/types/enum.ts";
import {useNavigate} from "react-router-dom";
import companyTitle from "@/assets/images/drone/company-title.png";
// import companyTitle from "@/assets/images/drone/zdhxc-bg.png";
import {toast} from "@/components/ui/use-toast.ts";
import {Depart} from "@/hooks/drone";
import {CommonInput} from "@/components/drone/public/CommonInput.tsx";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "请输入用户名"
  }),
  password: z.string().min(6, {
    message: "请输入密码"
  }),
});

const Login = () => {
  const OPERATION_HTTP_PREFIX = "/operation/api/v1";

  const {post, get} = useAjax();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = `${HTTP_PREFIX}/login`;
      const result = await post<Resource<{
        access_token: string
        workspace_id: string
        username: string
        user_id: string
        workspace_id_primary_key: number
        organs: Depart[]
      }>>(url, {
        ...values,
        flag: EUserType.Web,
      });

      const workspace_id_primary_key = result.data.data.workspace_id_primary_key.toString();
      localStorage.setItem(ELocalStorageKey.Token, result.data.data.access_token);
      localStorage.setItem(ELocalStorageKey.WorkspaceId, result.data.data.workspace_id);
      localStorage.setItem(ELocalStorageKey.Username, result.data.data.username);
      localStorage.setItem(ELocalStorageKey.UserId, result.data.data.user_id);
      localStorage.setItem(ELocalStorageKey.WorkspacePrimaryKey, workspace_id_primary_key);
      localStorage.setItem(ELocalStorageKey.Flag, EUserType.Web.toString());

      const departList = (await get<Resource<Depart>[]>(`${OPERATION_HTTP_PREFIX}/organ/list`, {
        id: workspace_id_primary_key
      })).data.data;

      if (departList?.length === 1) {
        navigate("/tsa");
        localStorage.setItem("departId", departList[0].id.toString());
      } else {
        navigate(`/depart?id=${workspace_id_primary_key}`);
      }
    } catch (err: any) {
      toast({
        description: "用户名或密码错误，登录失败！",
        variant: "destructive"
      });
    }

  };

  return (
    <Form {...form}>
      <form className={"h-full content-center relative bg-login bg-full-size"} onSubmit={form.handleSubmit(onSubmit)}>
        <div
          className={"w-[577px] h-[548px] bg-login-panel flex flex-col items-center pt-[102px] px-[111px] absolute left-[250px] bg-full-size"}>
          <h1 className={""}>
            <img src={companyTitle} alt=""/>
          </h1>
          <h2 className={"mt-[24px] mb-[40px]"}>- welcome to login -</h2>
          <div className={"w-full space-y-[16px]"}>
            <FormField
              control={form.control}
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <div className={"flex items-center relative space-x-[12px]"}>
                      <User className={""}/>
                      <CommonInput {...field} placeholder="请输入用户名"/>
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
                    <div className={"flex items-center relative space-x-[12px]"}>
                      <LockKeyhole className={""}/>
                      <CommonInput  {...field} type={"password"}
                                    placeholder="请输入密码"/>
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
          }} className={"border w-full mt-[40px]"}>登录</Button>
        </div>
      </form>
    </Form>
  );
};

export default Login;

