# Quy Tắc ClassName Cho Modal (Modal UI ClassName Rules)

Tài liệu này tổng hợp lại toàn bộ các `className` tiêu chuẩn được dùng để tạo các thành phần UI trong Modal (kế thừa từ `GameModal.tsx`). Mục tiêu là chỉ cần copy các chuỗi class này vào dự án là sẽ có giao diện đồng bộ, độc lập với việc bạn sắp xếp bố cục ra sao.

## 1. Khung Modal & Overlay (Wrapper)
- **Overlay (Nền tối bên ngoài):** 
  `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40`
- **Khung Modal chính (Container):** 
  `bg-white rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border-color`
  *(Có thể đổi `max-w-2xl` thành kích thước khác tùy ý)*

## 2. Header
- **Container của Header:** 
  `px-6 py-3 border-b border-border-color flex items-center justify-between`
- **Tiêu đề (Title):** 
  `text-xl font-bold text-text-main`
- **Nút Đóng (Close Button):** 
  Dùng component `<Button variant="ghost" size="icon">` và thêm class: 
  `h-9 w-9 text-text-secondary hover:bg-bg-secondary hover:text-text-main cursor-pointer`
  
## 3. Footer
- **Container của Footer:** 
  `px-6 py-4 border-t border-border-color flex items-center justify-end gap-3 bg-bg-secondary/50`
- **Nút Hủy (Cancel Button):** 
  Dùng component `<Button variant="outline">` và class: 
  `font-medium px-5`
- **Nút Lưu/Action chính:** 
  Dùng component `<Button>` kèm class: 
  `font-medium px-8`

## 4. Các Element trong Form (Inputs, Labels, Select, Checkbox)
- **Label chung:** 
  `font-medium text-text-main`
- **Dấu sao (*) bắt buộc:** 
  `<span className="text-error">*</span>`
- **Thẻ Textarea / Select (Native HTML):**
  Trạng thái bình thường: 
  `block w-full px-4 py-2.5 bg-bg-secondary border border-border-color rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all text-text-main` 
  *(Lưu ý: Đối với Textarea thêm `resize-none placeholder:text-text-secondary`)*
- **Checkbox:**
  - Container label bọc ngoài: `flex items-center gap-2 cursor-pointer`
  - Ô input checkbox: `w-4 h-4 text-primary rounded border-border-color focus:ring-primary/20 cursor-pointer`
  - Text mô tả checkbox: `text-sm font-medium text-text-main select-none`

## 5. Quy tắc Bắt Lỗi (Error Handling & Validation UI)

> [!IMPORTANT]
> **BẮT BUỘC ÁP DỤNG** quy tắc này cho tất cả các Form Modal. Tuyệt đối KHÔNG bỏ qua phần báo lỗi trực quan (inline errors) này trong bất kỳ form nào.

Khi form có lỗi (validation) đối với các trường bắt buộc, hệ thống không dùng toast error chung chung mà phải hiển thị báo lỗi trực tiếp (inline) bên dưới ô input và đổi viền ô đó thành màu đỏ. Đồng thời, lỗi của một trường phải được tự động xóa (clear) ngay khi người dùng bắt đầu nhập/sửa trường đó.

### Reset Lỗi Khi Đóng/Mở Modal:
Tuyệt đối phải reset lại state `fieldErrors` thành rỗng `{}` mỗi khi Modal được mở lên, để tránh tình trạng lỗi cũ vẫn còn lưu lại từ lần trước.
```tsx
useEffect(() => {
    if (isOpen) {
        setFieldErrors({}); // Reset lỗi
    }
}, [isOpen]);
```

### Class CSS cho Element khi có lỗi:
- Gắn thêm chuỗi class này vào Textarea/Select (Native) khi có lỗi:
  `border-error focus:outline-none focus:ring-1 focus:ring-error focus:border-error`
- Nếu dùng component `<Input>` của **shadcn**, chỉ cần class ngắn gọn: 
  `border-error focus-visible:ring-error`
- Nếu dùng component `<Select>` của **shadcn** (thẻ `<SelectTrigger>`):
  `className={cn("...", fieldErrors.fieldName ? "border-error focus:ring-error" : "border-border-color")}`

*Cách code mẫu cho Input:*
```tsx
<Input
    name="fieldName"
    value={formData.fieldName}
    onChange={e => {
        setFormData({ ...formData, fieldName: e.target.value });
        if (fieldErrors.fieldName) setFieldErrors({ ...fieldErrors, fieldName: "" }); // Clear lỗi khi nhập
    }}
    className={cn(fieldErrors.fieldName && "border-error focus-visible:ring-error")}
/>
```

### Text hiển thị dòng thông báo lỗi:
Bắt buộc phải nằm ngay dưới thẻ Input tương ứng.
- **Class bắt buộc:** 
  `text-[12px] text-error mt-0.5 italic`

*Cách code mẫu:*
```tsx
{fieldErrors.fieldName && (
    <p className="text-[12px] text-error mt-0.5 italic">{fieldErrors.fieldName}</p>
)}
```

## 6. Quy tắc Responsive (Hiển thị trên Mobile & Desktop)

Để Modal hiển thị tốt trên cả điện thoại (Mobile) và màn hình lớn (Desktop), cần áp dụng nguyên tắc thiết kế **Mobile-first** bằng Tailwind CSS:

1. **Bố cục Form (Chia cột):**
   Mặc định xếp dọc (column) trên điện thoại, trên Desktop (`md:`) thì chia thành các cột song song.
   - Thẻ bao bọc Form Content:
     `className="flex flex-col md:flex-row gap-6 px-6 py-4"`
   - Cột chính (bên trái):
     `className="flex-1 space-y-4"`
   - Cột phụ (bên phải) nếu có:
     `className="w-full md:w-[400px] shrink-0 space-y-4"`
     
2. **Kích thước Modal:**
   - Đảm bảo thẻ bọc ngoài cùng (Container) của Modal có class `w-full max-w-[...]` (ví dụ `max-w-[1100px]`) kết hợp với `max-h-[95vh] overflow-hidden flex flex-col` để không bị tràn màn hình trên mobile.
   - Nội dung cuộn được (Form) phải có `flex-1 overflow-y-auto custom-scrollbar`.
