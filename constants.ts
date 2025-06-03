
import { SelectOption } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const GENRE_OPTIONS: SelectOption[] = [
  { value: "", label: "Không chọn" },
  { value: "adventure", label: "Phiêu lưu" },
  { value: "chinh-kich", label: "Chính kịch (Drama)" },
  { value: "co-tich", label: "Cổ tích (Fairy Tale)" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "distopia", label: "Distopia (Dystopian)" },
  { value: "doi-thuong", label: "Đời thường (Slice of Life)" },
  { value: "du-ky", label: "Du ký (Travelogue)" },
  { value: "giao-duc", label: "Giáo dục (Educational)" },
  { value: "giat-gan", label: "Giật gân (Thriller)" },
  { value: "hai-huoc", label: "Hài hước (Humor)" },
  { value: "historical", label: "Lịch sử" },
  { value: "horror", label: "Kinh dị" },
  { value: "ky-ao", label: "Kỳ ảo (Fantasy)" },
  { value: "lang-man", label: "Lãng mạn (Romance)" },
  { value: "mystery", label: "Bí ẩn (Mystery)" },
  { value: "ngu-ngon", label: "Ngụ ngôn (Fable)" },
  { value: "sci-fi", label: "Khoa học viễn tưởng" },
  { value: "sieu-anh-hung", label: "Siêu anh hùng (Superhero)" },
  { value: "steampunk", label: "Steampunk" },
  { value: "trao-phung", label: "Trào phúng (Satire)" },
  { value: "trinh-tham", label: "Trinh thám (Detective)" },
  { value: "utopia", label: "Utopia (Utopian)" },
];

export const STYLE_OPTIONS: SelectOption[] = [
  { value: "", label: "Không chọn" },
  { value: "concise", label: "Ngắn gọn, súc tích" },
  { value: "colloquial", label: "Thân mật, đời thường" },
  { value: "descriptive", label: "Mô tả chi tiết" },
  { value: "formal", label: "Trang trọng" },
  { value: "humorous", label: "Hài hước" },
  { value: "poetic", label: "Thơ mộng, bay bổng" },
  { value: "like Ernest Hemingway", label: "Giống Ernest Hemingway" },
  { value: "like Gabriel Garcia Marquez", label: "Giống Gabriel Garcia Marquez (Hiện thực huyền ảo)" },
  { value: "like Haruki Murakami", label: "Giống Haruki Murakami (Kỳ ảo hiện thực, Nội tâm)" },
  { value: "like J.K. Rowling", label: "Giống J.K. Rowling (Kỳ ảo, Mô tả)" },
  { value: "like Nam Cao", label: "Giống Nam Cao (Hiện thực)" },
  { value: "like Nguyen Nhat Anh", label: "Giống Nguyễn Nhật Ánh" },
  { value: "like Stephen King", label: "Giống Stephen King (Kinh dị, Hồi hộp)" },
  { value: "like Thach Lam", label: "Giống Thạch Lam (Lãng mạn, Nhẹ nhàng)" },
  { value: "like To Hoai", label: "Giống Tô Hoài (Hiện thực, Đời thường)" },
  { value: "like Vu Trong Phung", label: "Giống Vũ Trọng Phụng (Trào phúng, Hiện thực phê phán)" },
];

export const TONE_OPTIONS: SelectOption[] = [
  { value: "", label: "Không chọn" },
  { value: "optimistic", label: "Lạc quan" },
  { value: "pessimistic", label: "Bi quan" },
  { value: "suspenseful", label: "Hồi hộp" },
  { value: "melancholy", label: "U sầu" },
  { value: "joyful", label: "Vui vẻ" },
  { value: "serious", label: "Nghiêm túc" },
  { value: "dark", label: "Tăm tối" },
  { value: "satirical", label: "Châm biếm" },
  { value: "nostalgic", label: "Hoài niệm" },
];

export const AUDIENCE_OPTIONS: SelectOption[] = [
  { value: "", label: "Không chọn" },
  { value: "children", label: "Trẻ em" },
  { value: "teenagers", label: "Thanh thiếu niên" },
  { value: "adults", label: "Người lớn" },
  { value: "general", label: "Mọi lứa tuổi" },
];

export const CHAPTERS_PER_GEN_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 chương" },
  { value: "2", label: "2 chương" },
  { value: "3", label: "3 chương" },
  { value: "5", label: "5 chương" },
  { value: "all", label: "Toàn bộ phần còn lại (nếu đã nhập tổng số chương)" },
  { value: "custom", label: "Tùy chỉnh..." },
];
