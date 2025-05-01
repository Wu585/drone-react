import {useCurrentUser} from "@/hooks/drone";

export const usePermission = () => {
  const {data: currentUser} = useCurrentUser();
    console.log('currentUser');
    console.log(currentUser);

};
