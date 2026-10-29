# TÀI LIỆU HỆ THỐNG NGUYÊN TẮC THIẾT KẾ UX/UI & TƯ DUY THIẾT KẾ (DESIGN THINKING)

> **Mục đích:** Tài liệu tham chiếu, quy chuẩn kiến thức và khung tư duy (framework) dùng để nạp vào System Prompt hoặc Context Prompt khi làm việc với AI trong các tác vụ: nghiên cứu người dùng, phân tích bài toán, thiết kế wireframe, UI/UX audit và tối ưu hóa trải nghiệm sản phẩm số.

---

## PHẦN 1: MỘT SỐ ĐỊNH LUẬT VÀ NGUYÊN TẮC THIẾT KẾ UX

Nguồn tham khảo chuẩn: [lawsofux.com](https://lawsofux.com/)

---

### 1. Định luật Fitts (Fitts's Law)
* **Định nghĩa:** Kích thước và khoảng cách các đối tượng ảnh hưởng đến thời gian cần thiết để di chuyển đến nó. *(Thời gian cần thiết để di chuyển một con trỏ tới một vùng mục tiêu là hàm số của khoảng cách tới mục tiêu chia cho kích thước của mục tiêu).*
* **Nguyên tắc cốt lõi:**
  * Mục tiêu cảm ứng phải đủ lớn để người dùng có thể chọn chính xác (khuyến nghị tối thiểu: 44x44 pt trên iOS, 48x48 dp trên Android).
  * Các mục tiêu cảm ứng phải có khoảng cách đủ rộng giữa chúng để tránh bấm nhầm.
  * Các mục tiêu cảm ứng phải được đặt trong các khu vực của giao diện cho phép dễ dàng chạm được chúng (vùng ngón tay cái - Thumb Zone trên mobile, mép và góc màn hình đối với desktop).

---

### 2. Định luật Jakob (Jakob's Law)
* **Định nghĩa:** Người dùng dành phần lớn thời gian của họ ở các trang web khác. Điều này có nghĩa là người dùng thích trang của bạn hoạt động giống như tất cả các trang web khác mà họ đã biết.
* **Nguyên tắc cốt lõi:**
  * Cần tập trung vào tính năng hơn là việc thay đổi thói quen người dùng so với các sản phẩm đã nổi tiếng trên thị trường (Mental Models - Mô hình tư duy quen thuộc).
  * Khi cần thay đổi, cần đi chậm và có sự chỉ dẫn rõ ràng cho người dùng.
  * Khi thay đổi, hãy giảm thiểu sự bất hòa bằng cách trao quyền cho người dùng tiếp tục sử dụng phiên bản cũ quen thuộc trong một thời gian giới hạn.

---

### 3. Định luật Hick (Hick's Law)
* **Định nghĩa:** Càng có quá nhiều sự lựa chọn phức tạp, càng mất nhiều thời gian để quyết định.
* **Nguyên tắc cốt lõi:**
  * Giảm thiểu các lựa chọn khi thời gian phản hồi là quan trọng để tăng thời gian quyết định.
  * Chia các nhiệm vụ phức tạp thành các bước nhỏ hơn để giảm tải nhận thức (Cognitive Load) – ví dụ: luồng đăng ký/thanh toán theo dạng Stepper đa bước.

---

### 4. Định luật Parkinson (Parkinson's Law)
* **Định nghĩa:** Công việc luôn tự mở rộng để chiếm đủ thời gian bạn dành cho nó.
* **Nguyên tắc cốt lõi:**
  * Giới hạn thời gian cần thiết để hoàn thành một công việc mà người dùng mong đợi (sử dụng Timeboxing, Forcing Function).
  * Giảm thời lượng thực tế để hoàn thành một tác vụ so với thời lượng dự kiến sẽ cải thiện trải nghiệm người dùng tổng thể (tự động điền dữ liệu, đề xuất thông minh, rút gọn form).

---

### 5. Hiệu ứng cô lập Von Restorff (Von Restorff Effect / Isolation Effect)
* **Định nghĩa:** Trong nhiều đối tượng giống nhau, đối tượng khác biệt có khả năng được ghi nhớ nhiều hơn.
* **Nguyên tắc cốt lõi:**
  * Làm cho thông tin quan trọng hoặc các hành động quan trọng trở nên khác biệt về mặt hình ảnh (màu sắc, kích thước, độ tương phản - ví dụ: Primary CTA button, gói cước khuyên dùng "Most Popular").
  * Hãy hạn chế khi nhấn mạnh vào các yếu tố hình ảnh để tránh chúng cạnh tranh với nhau và để đảm bảo các mặt hàng nổi bật không bị nhận dạng nhầm là banner quảng cáo (Banner Blindness).

---

### 6. Hiệu ứng Zeigarnik (Zeigarnik Effect)
* **Định nghĩa:** Người dùng thường nhớ các tác vụ chưa hoàn thành hoặc gián đoạn hơn so với các tác vụ đã hoàn thành.
* **Nguyên tắc cốt lõi:**
  * Mời khám phá nội dung bằng cách cung cấp các nội dung xem trước chưa đầy đủ.
  * Cung cấp thông tin rõ ràng về tiến độ và bước tiếp theo để thúc đẩy người dùng hoàn thành nhiệm vụ (ví dụ: thanh Progress Bar, thông báo "Hồ sơ của bạn đã hoàn thành 70%").

---

## PHẦN 2: TƯ DUY THIẾT KẾ (DESIGN THINKING)

Tư duy thiết kế là một phương pháp đã có từ lâu và được ứng dụng rộng rãi trong nhiều lĩnh vực, đặc biệt là trong thiết kế. Vì vậy, việc hiểu về Tư duy thiết kế là cần thiết cho người thiết kế nói riêng và những người làm việc trong ngành công nghệ sản xuất phần mềm nói chung.

### 1. Tư duy thiết kế là gì?
* Tư duy thiết kế không dành riêng cho thiết kế. Đây là phương pháp tư duy nhằm tìm ra vấn đề và giải quyết bằng cách hiểu rõ các nhu cầu liên quan đến con người, **lấy con người làm gốc (Human-Centered Design)**. 
* Giải pháp có thể là tạo ra một công nghệ mới hay một sản phẩm mới.
* Ứng dụng rộng rãi trong nhiều lĩnh vực: kinh doanh, tài chính, dịch vụ, giáo dục, y tế, thiết kế,... và cho chính bản thân cá nhân.

---

### 2. Quy trình 5 giai đoạn trong Design Thinking

```
[1. Đồng cảm] ──> [2. Xác định vấn đề] ──> [3. Lên ý tưởng] ──> [4. Tạo mẫu (Prototype)] ──> [5. Kiểm thử (Test)]
     ^                                                                                              │
     └────────────────────────── Lặp lại (Iteration) ──────────────────────────────────────────────┘
```

1. **Bước 1. Đồng cảm (Empathize):**
   * Đặt mình vào vị trí của người dùng và hiểu được vấn đề họ gặp phải thông qua việc nghiên cứu người dùng (phỏng vấn người dùng, khảo sát online,...).
2. **Bước 2. Xác định vấn đề (Define):**
   * Phân tích và tổng hợp thông tin thu thập được khi nghiên cứu người dùng.
   * Từ đó xác định nhu cầu, vấn đề cốt lõi của người dùng, thậm chí là những vấn đề họ chưa phát hiện ra.
3. **Bước 3. Lên ý tưởng (Ideate):**
   * Lên ý tưởng các giải pháp để giải quyết vấn đề đã xác định ở giai đoạn trước.
   * Giải pháp cho vấn đề có thể là một công nghệ mới, sản phẩm mới hay quy trình mới.
4. **Bước 4. Tạo giải pháp (Prototype):**
   * Tiến hành thực hiện các giải pháp dựa trên ý tưởng được đưa ra ở giai đoạn trước.
   * Mục đích là xác định giải pháp tốt nhất có thể cho từng vấn đề đã được xác định.
5. **Bước 5. Kiểm thử (Test):**
   * Kiểm tra giải pháp đã tạo ra liệu có khả thi, có đáp ứng nhu cầu của khách hàng, và từ đó điều chỉnh một cách phù hợp.
   * Quá trình này mang tính lặp lại (iteration) đối với các giai đoạn trước đó để liên tục cải tiến.

---

### 3. Tư duy thiết kế trong đời sống hàng ngày (Ví dụ thực tế)
* **Đồng cảm:** Nhìn nhận bản thân một cách nghiêm túc. Bạn cần hiểu rõ hiện tại bạn đang ở đâu, về mặt công việc, sức khỏe thể chất và tinh thần, các mối quan hệ. Đặt ra những câu hỏi thật sâu: *Bạn cảm thấy thực sự hạnh phúc là khi nào? Bạn muốn trở thành người như thế nào trong vòng 5 năm tới? Điều gì tạo động lực cho bạn?...*
* **Xác định vấn đề:** Xác định những gì bạn muốn đạt được trong cuộc đời của bạn, hay nói đúng hơn, kết quả cuộc đời bạn là gì. Bạn chỉ nhận ra được điều này nếu bạn thực sự hiểu rất rõ về bản thân mình – bạn đang làm gì, bạn là ai, bạn tin vào điều gì.
* **Lên ý tưởng:** Với những thứ bạn muốn đạt được, bắt đầu “động não” các giải pháp/cách/hành động cần làm. Có thể tìm kiếm ý tưởng bằng cách nói chuyện với những người đang đạt được những thành công trong cuộc sống tương tự với ước mơ của bạn.
* **Tạo giải pháp:** Dựa trên các ý tưởng đã vạch sẵn, lên kế hoạch để thực hiện chúng. *Ví dụ trong việc chăm sóc sức khoẻ: hạn chế thức khuya, ăn sáng đầy đủ, không uống cafe,...*
* **Kiểm thử:** Không phải giải pháp nào đưa ra cũng phù hợp và hiệu quả. Cần kiểm tra lại xem phương pháp nào là tốt nhất và phù hợp nhất để duy trì, đồng thời loại bỏ những phương pháp không mang lại hiệu quả.

---

### 4. Ứng dụng Tư duy thiết kế trong UX/UI Design & Bộ 5 câu hỏi cốt lõi
Tư duy thiết kế trong UX/UI hiểu đơn giản là người thiết kế cần phải **đặt mình vào vị trí người dùng và suy nghĩ thật kĩ trước khi thiết kế**. 

Với mỗi màn hình hoặc luồng thiết kế (user flow), bắt buộc phải trả lời trọn vẹn **5 câu hỏi đứng từ phía người dùng**:

| STT | Câu hỏi người dùng | Thành phần UI / Giải pháp tương ứng | Mục đích UX |
| :---: | :--- | :--- | :--- |
| **1** | **Tôi đang ở đâu?** | `Header title`, `Breadcrumbs`, Active Navigation Tab | Định vị vị trí hiện tại trong luồng/hệ thống, tránh lạc lối |
| **2** | **Tôi làm gì ở đây?** | `Call To Action (CTA)` (Nút hành động chính, form) | Nêu bật mục tiêu chính cần hoàn thành trên màn hình |
| **3** | **Tôi làm như thế nào?** | `Hint`, Placeholder, Tooltip, Microcopy, Hướng dẫn | Chỉ dẫn cách thức thao tác chuẩn xác, không gây bối rối |
| **4** | **Đây là cái gì?** | `Info` (Nhãn, mô tả, thẻ dữ liệu, trạng thái) | Cung cấp thông tin minh bạch, rõ nghĩa và dễ hiểu |
| **5** | **Tôi quay về như thế nào?** | `Back button`, nút Hủy, Đóng (X), Điều hướng thoát | Lối thoát an toàn khi muốn hủy tác vụ hoặc quay lại |

> *Ghi chú:* Để trả lời các câu hỏi này một cách chính xác, ngoài việc dựa trên phân tích cá nhân, chúng ta cần nghiên cứu và tham khảo trực tiếp từ người dùng thực tế.

---

### 5. Case Study: Dự án thiết kế ứng dụng di động hỗ trợ hành khách hoàn thành thủ tục bay (iACV)

* **Bối cảnh & Bài toán:** Đây là ứng dụng di động hỗ trợ hành khách hoàn thành thủ tục bay bao gồm tình trạng tiêm vắc-xin và xét nghiệm Covid. 
* **Quy trình người dùng:** Thực hiện đồng bộ thông tin tiêm vắc-xin trên ứng dụng -> Đặt lịch và tiến hành xét nghiệm Covid -> Nhận kết quả âm tính -> Mã QR của người dùng có hiệu lực và đủ điều kiện để qua cửa bay.
* **Phương pháp tiếp cận:** Đặt mình vào vị trí người dùng, phân tích quy trình chức năng và đặt ra các câu hỏi/vấn đề người dùng có thể gặp phải để xây dựng giải pháp UX.

#### Bảng tổng hợp Vấn đề & Giải pháp thiết kế (iACV UX Mapping):

| STT | Vấn đề từ góc nhìn người dùng | Giải pháp thiết kế UX/UI |
| :---: | :--- | :--- |
| **1** | Trong trường hợp người dùng mới đến sân bay lần đầu tiên, làm sao người dùng biết cần có những thủ tục gì mới có thể được bay? | Thiết kế chức năng hướng dẫn người dùng về quy trình check-in để lên máy bay có đầy đủ thông tin và các bước cụ thể người dùng cần thực hiện. |
| **2** | Đối với trẻ con, người già đi cùng người thân mà không có điện thoại thì làm cách nào có thể hoàn thành thủ tục trên ứng dụng? | Hỗ trợ sinh ra các mã QR code khác nhau cho từng người đi kèm, giúp tiện kiểm soát thông tin trên cùng 1 máy, không phải xét nghiệm hay sử dụng giấy tờ thủ công. |
| **3** | Một chuyến bay có quá nhiều thông tin đi kèm, làm sao để giảm tối thiểu công sức, thời gian của người dùng cho việc cung cấp thông tin chuyến bay? | Hỗ trợ đồng bộ thông tin chuyến bay dựa trên thông tin về CMND/CCCD/Hộ chiếu giúp người dùng đỡ phải nhập thông tin quá nhiều. |
| **4** | Làm sao để người dùng có thể đi đến phòng xét nghiệm một cách nhanh và thuận tiện nhất? | Thiết kế chức năng hiển thị bản đồ chỉ đường trực quan cho người dùng đi tới phòng xét nghiệm tại sân bay. |
| **5** | Làm sao giúp người dùng bớt lo lắng, chuẩn bị tâm lý sẵn sàng trước khi xét nghiệm Covid? | Thiết kế chức năng cung cấp thông tin về quy trình xét nghiệm, đi kèm là những lưu ý quan trọng trước, trong và sau khi xét nghiệm. |

---

## LƯU Ý: Đối với những chức năng chưa quen thuộc, đừng viết từ con số 0, hãy tìm kiếm các dự án mã nguồn mở trên Github để so sánh ý tưởng trước khi bắt tay vào làm.

