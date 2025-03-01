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

function TestStep() {
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <div className="flex h-full">
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
