#ifndef DINI_PARSER_H
#define DINI_PARSER_H

#include <stdint.h>
#include <stdbool.h>

/**
 * CẤU TRÚC KẾT QUẢ PHÂN TÍCH CHUỖI DINI ARGEO TRÊN STM32
 */
typedef struct {
    bool is_valid;          // true nếu chuỗi đúng định dạng Dini Argeo
    bool is_stable;         // true nếu mã trạng thái là 'ST' (Cân đã dừng dao động)
    float gross_weight;     // Khối lượng tổng (kg)
    float tare_weight;      // Khối lượng bì (kg)
    float net_weight;       // Khối lượng tịnh (kg)
    char unit[4];           // "kg" hoặc "g"
} DiniWeightData_t;

/**
 * Khởi tạo bộ đệm phân tích
 */
void Dini_Parser_Init(void);

/**
 * Hàm phân tích chuỗi ASCII nhận được từ UART của đầu cân Dini Argeo
 * @param raw_str: Chuỗi nhận được qua ngắt UART (ví dụ: "ST,GS,+  15.000,kg\r\n")
 * @param out_data: Con trỏ tới cấu trúc lưu kết quả
 * @return true nếu phân tích thành công
 */
bool Dini_Parse_Telegram(const char* raw_str, DiniWeightData_t* out_data);

/**
 * Đóng gói chuỗi JSON chuẩn bị gửi lên Backend Server qua HTTP/TCP
 * @param station_id: Mã trạm cân đã cấu hình trên chip (vd: "10244156")
 * @param data: Dữ liệu cân đã phân tích
 * @param json_buf: Bộ đệm xuất chuỗi JSON
 * @param max_len: Kích thước tối đa của bộ đệm
 */
int Dini_Format_JSON(const char* station_id, const DiniWeightData_t* data, char* json_buf, uint16_t max_len);

#endif // DINI_PARSER_H
