import { QuizQuestion } from '../types';

export const DEFAULT_HARDWARE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'hw-1',
    question: 'อุปกรณ์ชิ้นไหนเปรียบเสมือน "มันสมอง" สั่งการและประมวลผลคำนวณทุกอย่างในคอมพิวเตอร์?',
    options: [
      { key: 'ก', text: 'RAM (หน่วยความจำชั่วคราว)' },
      { key: 'ข', text: 'CPU (Central Processing Unit)' },
      { key: 'ค', text: 'Hard Disk (ฮาร์ดดิสก์)' },
      { key: 'ง', text: 'Power Supply (พาวเวอร์ซัพพลาย)' },
    ],
    answer: 'ข',
    explanation: 'CPU คือหน่วยประมวลผลกลาง ทำหน้าที่คิด วิเคราะห์ และสั่งการชิ้นส่วนทั้งหมด เปรียบเหมือนมันสมองตัวจริงของคอมพิวเตอร์!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-2',
    question: 'ถ้าเผลอเตะปลั๊กไฟหลุดกะทันหัน ข้อมูลในอุปกรณ์ชิ้นใดจะ "หายวับไปกับตา" ทันที?',
    options: [
      { key: 'ก', text: 'SSD (Solid State Drive)' },
      { key: 'ข', text: 'Flash Drive' },
      { key: 'ค', text: 'RAM (Random Access Memory)' },
      { key: 'ง', text: 'ROM (Read Only Memory)' },
    ],
    answer: 'ค',
    explanation: 'RAM เป็นหน่วยความจำแบบ Volatile ต้องมีกระแสไฟเลี้ยงตลอดเวลา พอไฟดับปุ๊บ ข้อมูลงานที่ยังไม่ได้กด Save จะหายหมดเกลี้ยง!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-3',
    question: 'สายเกมเมอร์และงานตัดต่อ 3D ต้องกราบกราน! อุปกรณ์ใดเน้นการคำนวณเรนเดอร์ภาพกราฟิกความเร็วสูง?',
    options: [
      { key: 'ก', text: 'GPU / การ์ดแสดงผล (Graphics Processing Unit)' },
      { key: 'ข', text: 'Sound Card (การ์ดเสียง)' },
      { key: 'ค', text: 'Network Card (การ์ดแลน)' },
      { key: 'ง', text: 'Capture Card (การ์ดบันทึกภาพ)' },
    ],
    answer: 'ก',
    explanation: 'GPU ถูกสร้างขึ้นมาเพื่อคำนวณพิกเซลและมิติภาพแบบขนานหลายพันคอร์พร้อมกัน ทำให้ภาพเกมลื่นไหลและเรนเดอร์งาน 3D ได้รวดเร็ว!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-4',
    question: 'อุปกรณ์เก็บข้อมูลยุคใหม่ชนิดใด ไม่มีหัวอ่านจานหมุนเลย อ่านเขียนไวฟ้าผ่าด้วยชิปแฟลช?',
    options: [
      { key: 'ก', text: 'HDD (Hard Disk Drive จานหมุน)' },
      { key: 'ข', text: 'SSD (Solid State Drive)' },
      { key: 'ค', text: 'Floppy Disk (แผ่นดิสก์ 1.44MB)' },
      { key: 'ง', text: 'Optical DVD-RW Drive' },
    ],
    answer: 'ข',
    explanation: 'SSD ใช้ชิป NAND Flash ในการบันทึกข้อมูล ไม่มีชิ้นส่วนขยับเขยื้อน จึงอ่านเขียนเร็วกว่าฮาร์ดดิสก์แบบเดิมหลายเท่าตัว และทนต่อแรงตกกระแทกได้ดีกว่า!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-5',
    question: '"หัวใจแปลงพลังงาน" ชิ้นส่วนใดแปลงไฟบ้าน AC 220V ให้เป็นไฟ DC ป้อนอุปกรณ์ทุกชิ้นในเครื่อง?',
    options: [
      { key: 'ก', text: 'UPS (เครื่องสำรองไฟ)' },
      { key: 'ข', text: 'Mainboard (เมนบอร์ด)' },
      { key: 'ค', text: 'Power Supply Unit (PSU)' },
      { key: 'ง', text: 'CPU Liquid Cooler' },
    ],
    answer: 'ค',
    explanation: 'PSU ทำหน้าที่รับกระแสไฟฟ้าสลับจากไฟบ้าน แล้วแปลงเป็นกระแสตรงแรงดัน 12V, 5V, 3.3V จ่ายไฟให้ฮาร์ดแวร์ทุกชิ้นอย่างมีเสถียรภาพ!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-6',
    question: 'แผงวงจรหลักที่เป็นศูนย์กลางเชื่อมต่อทุกอุปกรณ์เข้าด้วยกัน เหมือน "โครงกระดูกและเส้นประสาท" คืออะไร?',
    options: [
      { key: 'ก', text: 'Motherboard (Mainboard)' },
      { key: 'ข', text: 'Computer Case Chassis' },
      { key: 'ค', text: 'Backplate Heat Shield' },
      { key: 'ง', text: 'Chipset Cooling Fan' },
    ],
    answer: 'ก',
    explanation: 'Motherboard หรือเมนบอร์ด รวมซ็อกเก็ต CPU, สล็อต RAM, พอร์ต PCIe และชิปเซ็ต ช่วยส่งต่อสัญญาณข้อมูลระหว่างอุปกรณ์ทุกชิ้น!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-7',
    question: 'สารเหนียวสีเทาที่ทาคั่นกลางระหว่างหน้าสัมผัส CPU กับชุดฮีตซิงก์ มีไว้เพื่อประโยชน์ข้อใด?',
    options: [
      { key: 'ก', text: 'ใช้เป็นกาวเหนียวกันพัดลมหล่น' },
      { key: 'ข', text: 'ใช้เป็นฉนวนไฟฟ้าป้องกันไฟดูด' },
      { key: 'ค', text: 'ช่วยเติมเต็มช่องว่างอากาศเพื่อส่งผ่านความร้อน' },
      { key: 'ง', text: 'ช่วยเคลือบกันสนิมและกันน้ำเกาะ' },
    ],
    answer: 'ค',
    explanation: 'ซิลิโคนนำความร้อน (Thermal Paste) เข้าไปอุดช่องว่างระดับจุลภาคระหว่างโลหะสองชิ้น ทำให้อากาศไม่กักเก็บความร้อน และระบายความร้อนได้เต็มประสิทธิภาพ!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-8',
    question: 'จอภาพเกมมิ่งที่ระบุสเปก "144Hz หรือ 240Hz" ตัวเลข Hz (เฮิรตซ์) นี้หมายความว่าอย่างไร?',
    options: [
      { key: 'ก', text: 'รอบหมุนของพัดลมระบายความร้อนในจอ' },
      { key: 'ข', text: 'จำนวนครั้งที่หน้าจอวาดภาพใหม่ได้ใน 1 วินาที' },
      { key: 'ค', text: 'ระดับความสว่างสูงสุดของหลอดไฟหน้าจอ' },
      { key: 'ง', text: 'ความเร็วในการเชื่อมต่อสาย HDMI' },
    ],
    answer: 'ข',
    explanation: 'Refresh Rate (Hz) คืออัตรารีเฟรชภาพ เช่น 144Hz แปลว่าจอวาดภาพใหม่ 144 ครั้งต่อวินาที ยิ่งเลขเยอะ ภาพเคลื่อนไหวในเกมยิ่งนุ่มเนียนตาไม่เบลอ!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-9',
    question: 'ในคีย์บอร์ดกลไก (Mechanical Keyboard) สวิตช์สีใดที่กดแล้วมีเสียง "คลิกสองจังหวะ" ดังสะใจสายพิมพ์งาน?',
    options: [
      { key: 'ก', text: 'Red Switch (Linear ลื่นเงียบ)' },
      { key: 'ข', text: 'Blue Switch (Clicky เสียงกริ๊กสองจังหวะ)' },
      { key: 'ค', text: 'Brown Switch (Tactile ไร้เสียงคลิก)' },
      { key: 'ง', text: 'Black Switch (Heavy Linear แรงต้านสูง)' },
    ],
    answer: 'ข',
    explanation: 'Blue Switch มีกลไก Click jacket เวลาปุ่มลงมาถึงจุดทำงานจะมีเสียงคลิกแหลมชัดเจนและจังหวะสะท้อนกลับ เป็นขวัญใจคนชอบพิมพ์มันส์ๆ!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
  {
    id: 'hw-10',
    question: 'ชิปบนเมนบอร์ดที่เก็บโปรแกรมตรวจสอบอุปกรณ์เบื้องต้น (POST) และเริ่มบูตคอมพิวเตอร์ทันทีที่กดเปิดเครื่องคืออะไร?',
    options: [
      { key: 'ก', text: 'BIOS / UEFI บนชิป ROM' },
      { key: 'ข', text: 'L3 Cache Memory' },
      { key: 'ค', text: 'Windows Registry' },
      { key: 'ง', text: 'Boot Sector ในไดรฟ์ C:' },
    ],
    answer: 'ก',
    explanation: 'BIOS / UEFI บรรจุอยู่ในชิป ROM บนเมนบอร์ด คอยตรวจสอบฮาร์ดแวร์พื้นฐานทั้งหมดตอนกดสวิตช์เปิดเครื่อง ก่อนส่งต่อไปให้ระบบปฏิบัติการเริ่มรัน!',
    difficulty: 'ปานกลาง',
    category: 'อุปกรณ์คอมพิวเตอร์'
  },
];
