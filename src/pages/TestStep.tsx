import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { defineStepper } from '@stepperize/react';

const { useStepper, steps, utils } = defineStepper(
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Enter your shipping details',
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Enter your payment details',
  },
  { id: 'complete', title: 'Complete', description: 'Checkout complete' }
);

export const a = 'PK\u0003\u0004\u0014\u0000\u0000\u0000\u0008\u0000\u0000\u0000\u0000\u0000\u0083Nð1a\u0004\u0000\u0000å\u0010\u0000\u0000\u0011\u0000\u0000\u0000wpmz/template.kmlµXËnã6\u0014Ýç+\u000c¯=ÖÃò+p4È$q\u0012 \u00831lO³f$Úf-\u0091\u0002EÅñ|Ê,ºíª\u007fP _Óö7JY¢DR´]\u000c2YE<÷\u001c^ò>Hzòñ-\u008eZ¯\u0090¦\u0088à«¶ÓµÛ-\u0088\u0003\u0012"¼¾j\u007f]N?\u008cÚ\u001fý\u008bÉ\u0096[qK\u009c^µ7\u008c%\u0097\u0096µÛíº$\u0081x\u008dÒ.\u0086Ìâ\u0016\u0096ÛuÛ\u0085Ùå.\u0089#Å6ü\u0015u\u0003\u0012[\u001cøfñyº\u0083¶\u007fÑjMnI\u0090Å\u0010³ü\u0083\u007fæ¼K\u0090±\r¡þ¿\u007fýùÏo\u007f|øû÷ï\u0013K\u001e\u0097,\u0003\n\u0001\u0083K\u0014Cß\u0019zö 7\u001a{£\u0091í\u0095\u0004\u0009\u0096HY\u0012J$Ç±\u001dÏólÛ.I\u0012,\u0091b\u0094æ{tCð\n­\u000b@@«h¿$Ï`\u001f\u0021\u000c?\u0093\u0010ú)XÁh_Ê5P\u0095\u008b0J7×\u0001ãÚþ\u009a<\u0090\u0018\n\u009e\u008c(\u001cø\u0086Ø\u0017<¿y")ã\u001cî\u0012C8\u0013<\u0005Õx0È\u0018, jÊO ØVÔ¦\u0081¢ÀÀ\u0016~Y­\u0016Ü\u008c"¶\u007f\u0080h½a~Oì\u009c\u00196)ÌájF\u0010Î¹ÝÑ¸o\u008fÆ\u001dÇuº^¿×ëõ;Î°;ì\rF½\u0081ª[\u0091N)^ß?\u0095óÚfvm È¬#ò\u0002¢%\u00058EùÂA´H \u000c}Ç-e\u008e\u0019\u0018TæË\u0087r\n§Ê*\u001dQh\u0021%\u0018>â\u0015\u0011Ã\np\u0087³ø\u0017\u0010eÐ\u001f\u000cK5mÜÄZd/µ\u0081#ó\u0014Døa\u0099\u001d)\u0004\u0013\u009e¾\u0004\u0084&\u000fK¨\u0016ì÷J­\u0006bf*Þ¸*×ä©F\u009f\u0091"\u001c\u008f8\u0084oUÌ\u008d ºÔÆ\u009aÊqC¡O¦$\n\u0021Õò\u000eÆI\u00947\u008a}\u0002ý\u001dØ\'yr\u0089\u0094\u00931#ë1¬ó³\u001eRLwEÏ¸\u0021\u0084òvÌ\r\u0016ût\u0006(\u0088õ\u009d\u0008*\u008bC\u007fy¾_\u008cª\u0006¨B\u001aqsHÅ\u0003rwÿy,ÊM\u001aV·ì¬GUû&Ó(×(KÈ©û·\u0002\u0018JGÔ\u008d3VêÆT4\u0001\u0088P¡v\u0087ÁK\u0004«\rm\u0000ê<(æ\u00823Ä\u0082Ía\u00891À\u0019\u0088Äl\u001ahðð¹\u000cõ\u0003\u0004ù)i\u008cÈNµ9H­H\u0014\u0091]y\u0010Ô\u001bÚ°;-u\u008d×ÒJ\u008dà\u0011\u0001Þü\u008aîiwíÃ_§ñ\u008f¦Z1N»4\u0003l#­ð\u0013\u0008¯i`v°2=£H\u0090ZÎÇp5=ÏÇÇ\u0014ÇeFñÁ\'F\u008aó\u0001\u0087\u000bF\u0092gÄ6·(\r\u008aÃ\u0095\u009ff7\u0019}\u0005,£Ð8[¥b\u0098ék\n\u0017\u008c\u0082<\u0021\u009fxì«flF\u0085À,\u0002\u0001\u008c\u0001ÝJ\u009b¥\u0085\u0083\u008fÔ\u0005\u009eÊã­Vq\u009còËÐÐsû\u009dÃ1ëy}×\u0019\u000eeºeäO,cÜ\u0091\u0012\u0013$G ºbD\u0011JR\u0082BQÇ|bwà\u000clg8\u001e:®hïº\u0099±/IM`c4\u0013Y¡u\u0019uø\\î*Õû®õû\u000e\u0015ü3jøgTñ;Õ±|Ðüï\u001e\u009bWÞ\u00990þh\u00897ø\'g¸\u0005qÂ\u009då\u008ay|\\\u0083\u0086lqlÉ\u0086å\u0094¯\u0096\u0014Þ+G¤x®hãÇhe\u0095è,c\u0095H\u009aR\u0000\u000c3\u001e\u000fOeT/¨Á?µVcÇÔÇõ\u0006\u0095ÎQºÝ×-ªü®\u008e\u0089FOU¯\u0092&W~ø\u009aY½ðø\u00037-*\u000bÑ\u0094Í¤kb\ri\u009c\u00182HEC\u0001üy\u000eÖ"\'\u0015H£QÈD¦¦(ï$óÃÀ4\u009f·¤K&\u001a9åÉÉ[ÛzÎÏ\u0002ßõ¤^¢ :+\u0000\u0018\u000bw(L ã;ñ*\u009cUP=X1_Ô\u0094Ð\u00180\u007f\u0087BØùFHÜATÄN\u0082\u008d\u0017w)Z\u0013«¾ O¬ú\u0017\u0085Iþ«\u0084\u007fñ\u001fPK\u0003\u0004\u0014\u0000\u0000\u0000\u0008\u0000\u0000\u0000\u0000\u0000\u0017\u0085\u0005\u0019\u0015\u0003\u0000\u0000ö\n\u0000\u0000\u0012\u0000\u0000\u0000wpmz/waylines.wpml\u008dVYo£0\u0010~ï¯\u0088xîr5W+J\u0095\u009e©ÔU£&»Ñ>º`\u00887ÆFÆ\u0094f\u007fý\u009ap\u001aLÓ>\u0095ù\u008e\u0019\u008fÇv\u009c\u009bÏ\u0008\u008f> K\u0010%×\u009a¥\u009bÚ\u0008\u0012\u008fú\u0088\u0084×Ú¯Íã\u008f¹vã\u009e9{Á\u0012L\u0092\\k;Îã+ÃÈ²L§1$\u0021Jt\u0002¹\u0021\u0018\u0086­ÛZA»Êâ\u0008K\\ÿ/Ò=\u001a\u0019\u0002øg\u0088<úTsÏF#ç\u009ezi\u0004\u0009Ï?Äg®»\u008aP\u0092×sGI\u0080Â\u0002¨ \u0000\u001f6t\u000b\u000e\u0018\u0011ø\u0093úÐM@\u0000ñÁ1Ô¨¬E\u0004%»\u0085Ç\u0085·\u001bÒ%\u008d`¥k#\u0092\u0006~"þJÞî^hÂ\u0085F\u0094Ä\u0011I+\u009d\u0084vtÐK9, :å-ðöµ´O\u0090\u001c8ØÃ× X\u000b\u001aCü°\u0084(Üq÷Â,õjXr\u00081}\u0007xÃ\u0000IPî\u000fð:\u0086Ðw-»ô\u0018"(\\Þ6Ë2\u0085e\u009a\u0092¼A$\u0099Ï(\u0081Ï$ UX\u0002\u001eH\u001aý\u00068\u0085îtVºuâ*Õ:}o\u0008V[\'\u0021U\u001d\u0086º\u0090Â0\u0016SB\u0081¯ª°\u0084\u001aÃÉEéÕCÔJ©\u001a[Öª*íÈW´Ø\u008egâÃO×\u0094õ2(/µ·¦2®8OÎ#Å>d\u009d\u0091\u0083Q\u008c\u0001\u0087Ï~\u009dµ\u0015RÍw±óÇ£¶}ZÏÇòp·PI\u009c\u0015\'´\u0095¦\u0089ÈC\u0084\u0012\u000e\u0088\u0007k^\u001d\u0090i)\u0003Ç\u0003TÓª\u0080D\u0003)§\u008f8/©<\u0007Õ\u0008u\u0081JµÂÀ\u0083\u0011`ûÖF­("¼ù\u0016\u0011\u008fR&îKÑ¤¤\u001d\u001f\u008d,ÛÒÇ\u0093ñ|>\u001bÛ\u0093ó\u000bS\u009f_\u008eÇ\u0013Û\u009aÍÚrC©w\u008cN¢b\u0009H\u001a\u0009Ô\u009e\u0001åÎ¸\u0096HkO­©iÍ.g\u0096m«6¨ë 6#Î\u0093wº$\u0087\u00074K\u0008ò·c\u0005\u0018\u0088¤.©XÇÉ\u0008(Æ4+/íNª6ï\u0094Ù\u0082\u0084\u0018¶\u0007ª\u000f\u000eZ\u0088^\u0017í6uóøwÞû§ã[+¾UÖ\u0003\u0001ï\'\u008a+)§ìV\u0080ïZm»\u0005þ\u0082yjÛ\u009azÒ\u0093"ùª\u0019Â[Óù\u008dM\u0097smRFNLEN9\u0016Ìé±·\u000bâ¯9\u008d·\u0088ïîQâ\u0015O¯xëîRö\u0001xÊºÓRë¿Ìp\u000f¢X\u0014+\u001cyoÁ]|hÁ\u008aÅ\u0014\u0089Ò\u0004®9\u0003ù©z\u0011ã\\?RÝø@\u0093\u009eP$^Ôï\u009d¡\u0082»BÜÛ©G¿G8aõ\u0007d_\u0019ÕðPS¾*¾¼½\u00927\u0094ì\u000fÍýU~\u000ftcKÙ~s\u0088û\u0005Õ@ýüunjÇh\u009e7Çh~b:ùÏT÷ì?PK\u0001\u0002\u0000\u0000\u0014\u0000\u0000\u0000\u0008\u0000\u0000\u0000\u0000\u0000\u0083Nð1a\u0004\u0000\u0000å\u0010\u0000\u0000\u0011\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000wpmz/template.kmlPK\u0001\u0002\u0000\u0000\u0014\u0000\u0000\u0000\u0008\u0000\u0000\u0000\u0000\u0000\u0017\u0085\u0005\u0019\u0015\u0003\u0000\u0000ö\n\u0000\u0000\u0012\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0000\u0000\u0090\u0004\u0000\u0000wpmz/waylines.wpmlPK\u0005\u0006\u0000\u0000\u0000\u0000\u0002\u0000\u0002\u0000\u007f\u0000\u0000\u0000Õ\u0007\u0000\u0000\u0000\u0000'

// 修改下载函数
const downloadKmz = () => {
  // 直接将字符串转换为字节数组
  const byteNumbers = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    byteNumbers[i] = a.charCodeAt(i);
  }
  
  // 创建 Blob
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/vnd.google-earth.kmz' });
  
  // 创建下载链接
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'template.kmz';
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

function TestStep() {
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <div className="flex h-full">
      {/* 添加下载按钮 */}
      <div className="absolute top-4 right-4">
        <Button 
          onClick={downloadKmz}
          className="bg-[#43ABFF] hover:bg-[#43ABFF]/90"
        >
          下载 KMZ 文件
        </Button>
      </div>

      {/* 左侧步骤条 */}
      <div className="w-[200px] border-r p-6 h-full">
        <ol className="flex flex-col gap-6">
          {stepper.all.map((step, index) => (
            <li key={step.id} className="flex items-center gap-4">
              <div className="relative">
                <Button
                  type="button"
                  role="tab"
                  variant={index <= currentIndex ? 'default' : 'secondary'}
                  aria-current={stepper.current.id === step.id ? 'step' : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    stepper.current.id === step.id ? 'bg-[#43ABFF]' : 'bg-gray-200'
                  }`}
                  onClick={() => stepper.goTo(step.id)}
                >
                  {index + 1}
                </Button>
                {/* 连接线 */}
                {index < stepper.all.length - 1 && (
                  <div 
                    className={`absolute left-1/2 h-[40px] w-[2px] -translate-x-1/2 ${
                      index < currentIndex ? 'bg-[#43ABFF]' : 'bg-gray-200'
                    }`} 
                    style={{top: '40px'}}
                  />
                )}
              </div>
              <span className={`text-sm font-medium ${
                stepper.current.id === step.id ? 'text-[#43ABFF]' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* 中间内容区 */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium">{stepper.current.title}</h2>
          <p className="text-sm text-gray-500">{stepper.current.description}</p>
        </div>

        {/* 当前步骤内容 */}
        <div className="mb-6">
          {stepper.switch({
            shipping: () => <ShippingComponent />,
            payment: () => <PaymentComponent />,
            complete: () => <CompleteComponent />,
          })}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-4">
          {!stepper.isFirst && (
            <Button variant="outline" onClick={stepper.prev}>
              上一步
            </Button>
          )}
          {!stepper.isLast ? (
            <Button onClick={stepper.next}>下一步</Button>
          ) : (
            <Button onClick={stepper.reset}>完成</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const ShippingComponent = () => {
  return (
    <div className="grid gap-4 w-full">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-start">
          Name
        </label>
        <Input id="name" placeholder="John Doe" className="w-full" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="address" className="text-sm font-medium text-start">
          Address
        </label>
        <Textarea
          id="address"
          placeholder="123 Main St, Anytown USA"
          className="w-full"
        />
      </div>
    </div>
  );
};

const PaymentComponent = () => {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="card-number" className="text-sm font-medium text-start">
          Card Number
        </label>
        <Input
          id="card-number"
          placeholder="4111 1111 1111 1111"
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label
            htmlFor="expiry-date"
            className="text-sm font-medium text-start"
          >
            Expiry Date
          </label>
          <Input id="expiry-date" placeholder="MM/YY" className="w-full" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="cvc" className="text-sm font-medium text-start">
            CVC
          </label>
          <Input id="cvc" placeholder="123" className="w-full" />
        </div>
      </div>
    </div>
  );
};

const CompleteComponent = () => {
  return <h3 className="text-lg py-4 font-medium">Stepper complete 🔥</h3>;
};

export default TestStep;
