import svgPaths from "./svg-uemarp4dxh";

function Paragraph() {
  return (
    <div className="absolute h-[18px] left-[24px] top-[24px] w-[460.391px]" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-neutral-950 text-nowrap top-px whitespace-pre">Thêm khách hàng mới</p>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[14px] relative shrink-0 w-[460.391px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[14px] relative w-[460.391px]">
        <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre">Tên khách hàng</p>
      </div>
    </div>
  );
}

function TextInput() {
  return (
    <div className="basis-0 bg-[#f3f3f5] grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-[460.391px]" data-name="Text Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] w-[460.391px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#717182] text-[14px] text-nowrap whitespace-pre">VD: Nguyễn Văn A...</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[53px] relative shrink-0 w-[460.391px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3px] h-[53px] items-start relative w-[460.391px]">
        <Label />
        <TextInput />
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute h-[14px] left-0 top-0 w-[460.391px]" data-name="Label">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre">Giới tính</p>
    </div>
  );
}

function Dropdown() {
  return <div className="absolute bg-[#f3f3f5] border border-[rgba(0,0,0,0)] border-solid h-[36px] left-0 rounded-[8px] top-0 w-[460.391px]" data-name="Dropdown" />;
}

function Group() {
  return (
    <div className="absolute bottom-[37.5%] contents left-1/4 right-1/4 top-[37.5%]" data-name="Group">
      <div className="absolute bottom-[37.5%] left-1/4 opacity-50 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
            <path d={svgPaths.p1112dfa0} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[432.39px] size-[16px] top-[10px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[36px] left-0 top-[17px] w-[460.391px]" data-name="Container">
      <Dropdown />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[53px] relative shrink-0 w-[460.391px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[53px] relative w-[460.391px]">
        <Label1 />
        <Container2 />
      </div>
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[14px] relative shrink-0 w-[460.391px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[14px] relative w-[460.391px]">
        <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre">Ngày sinh</p>
      </div>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="basis-0 bg-[#f3f3f5] grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-[460.391px]" data-name="Text Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] w-[460.391px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#717182] text-[14px] text-nowrap whitespace-pre">VD: 15/01/1990...</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[53px] relative shrink-0 w-[460.391px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3px] h-[53px] items-start relative w-[460.391px]">
        <Label2 />
        <TextInput1 />
      </div>
    </div>
  );
}

function Label3() {
  return (
    <div className="h-[14px] relative shrink-0 w-[460.391px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[14px] relative w-[460.391px]">
        <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre">Số điện thoại</p>
      </div>
    </div>
  );
}

function PhoneInput() {
  return (
    <div className="basis-0 bg-[#f3f3f5] grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-[460.391px]" data-name="Phone Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] w-[460.391px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#717182] text-[14px] text-nowrap whitespace-pre">VD: 0901234567...</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[53px] relative shrink-0 w-[460.391px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3px] h-[53px] items-start relative w-[460.391px]">
        <Label3 />
        <PhoneInput />
      </div>
    </div>
  );
}

function Label4() {
  return (
    <div className="absolute h-[14px] left-0 top-0 w-[460.391px]" data-name="Label">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre">Tỉnh / Thành phố</p>
    </div>
  );
}

function Dropdown1() {
  return <div className="absolute bg-[#f3f3f5] border border-[rgba(0,0,0,0)] border-solid h-[36px] left-0 rounded-[8px] top-0 w-[460.391px]" data-name="Dropdown" />;
}

function Group1() {
  return (
    <div className="absolute bottom-[37.5%] contents left-1/4 right-1/4 top-[37.5%]" data-name="Group">
      <div className="absolute bottom-[37.5%] left-1/4 opacity-50 right-1/4 top-[37.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 6">
            <path d={svgPaths.p1112dfa0} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group1 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[432.39px] size-[16px] top-[10px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[36px] left-0 top-[17px] w-[460.391px]" data-name="Container">
      <Dropdown1 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[53px] relative shrink-0 w-[460.391px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[53px] relative w-[460.391px]">
        <Label4 />
        <Container7 />
      </div>
    </div>
  );
}

function Label5() {
  return (
    <div className="h-[14px] relative shrink-0 w-[460.391px]" data-name="Label">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[14px] relative w-[460.391px]">
        <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14px] left-0 text-[14px] text-neutral-950 text-nowrap top-0 whitespace-pre">Địa chỉ</p>
      </div>
    </div>
  );
}

function TextInput2() {
  return (
    <div className="basis-0 bg-[#f3f3f5] grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-[460.391px]" data-name="Text Input">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center overflow-clip px-[12px] py-[4px] relative rounded-[inherit] w-[460.391px]">
        <p className="font-['Arimo:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#717182] text-[14px] text-nowrap whitespace-pre">VD: 123 Đường ABC, Quận 1...</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[460.391px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3px] h-full items-start relative w-[460.391px]">
        <Label5 />
        <TextInput2 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[16px] h-[398px] items-start left-0 pl-[24px] pr-0 py-0 top-[58px] w-[508.391px]" data-name="Container">
      <Container />
      <Container3 />
      <Container4 />
      <Container5 />
      <Container8 />
      <Container9 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[20px] left-[12.5px] text-[14px] text-center text-neutral-950 text-nowrap top-0 translate-x-[-50%] whitespace-pre">Hủy</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[36px] relative rounded-[8px] shrink-0 w-[60.5px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start pb-px pt-[9.797px] px-[17.797px] relative w-[60.5px]">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[20px] left-[56.5px] text-[14px] text-center text-nowrap text-white top-0 translate-x-[-50%] whitespace-pre">Thêm khách hàng</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#155dfc] h-[36px] relative rounded-[8px] shrink-0 w-[144.078px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[36px] items-start pb-0 pt-[8px] px-[16px] relative w-[144.078px]">
        <Paragraph2 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute box-border content-stretch flex gap-[8px] h-[84px] items-start justify-end left-0 pb-0 pl-0 pr-[24px] pt-[24px] top-[456px] w-[508.391px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Form() {
  return (
    <div className="absolute h-[540px] left-0 top-0 w-[508.391px]" data-name="Form">
      <Paragraph />
      <Container10 />
      <Container11 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
            <path d={svgPaths.p31ac93c0} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
            <path d={svgPaths.p1c3aed40} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[468.39px] opacity-70 rounded-[2px] size-[16px] top-[16px]" data-name="Button">
      <Icon2 />
    </div>
  );
}

export default function Container12() {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.1)] border-solid relative rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-full" data-name="Container">
      <Form />
      <Button2 />
    </div>
  );
}