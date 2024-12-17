import Uploady from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import {client} from "@/hooks/bicycles/api.ts";
import {useLandmarkList} from "@/hooks/bright-kitchen/api.ts";
import {useToast} from "@/components/ui/use-toast.ts";

const HealthTable = () => {
  const {data: landmarkList, mutate} = useLandmarkList();
  const data = [
    {
      business: "鱼你在一起",
      personList: [
        {
          name: "小王"
        },
        {
          name: "小明"
        }
      ]
    },
    {
      business: "辛大厨",
      personList: [
        {
          name: "小红"
        },
      ]
    },
    {
      business: "蒋大厨",
      personList: [
        {
          name: "小刚"
        },
        {
          name: "小李"
        },
        {
          name: "小胡"
        }
      ]
    }
  ];

  const {toast} = useToast();

  const onComplete = (xhr: XMLHttpRequest, person: { name: string }) => {
    client.post("fpLandmark/create", {
      zzr: person.name,
      picture: JSON.parse(xhr.response).msg
    }).then(async () => {
      toast({
        description: "上传成功！"
      });
      await mutate();
    });
    return xhr.status === 200;
  };

  const onPreviewImage = (person: { name: string }) => {
    if (!landmarkList) return;
    const image = landmarkList.find(item => item.zzr === person.name)?.picture;
    window.open(`http://36.152.38.220:8888/fpLandmark/images/${image}`);
  };

  return (
    <div className={"w-full h-[400px] overflow-y-auto"}>
      {data.map((item, index) => (
        <div key={index} className="flex items-start border-b border-gray-300 py-2">
          <div className="flex-1">{item.business}</div>
          <div className="flex-1 flex space-x-8">
            {item.personList.map((person, personIndex) => (
              <div className={"cursor-pointer"} key={personIndex}>
                {landmarkList && landmarkList.find(item => item.zzr === person.name) ?
                  <span onClick={() => onPreviewImage(person)} className={"text-[#33DAFC]"}>{person.name}</span> :
                  <Uploady isSuccessfulCall={(x) => onComplete(x, person)}
                           destination={{url: "http://36.152.38.220:8888/fpLandmark/file"}}>
                    <UploadButton>
                      {person.name}
                    </UploadButton>
                  </Uploady>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthTable;
