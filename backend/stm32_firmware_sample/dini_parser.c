#include "dini_parser.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void Dini_Parser_Init(void) {
    // Khởi tạo các cờ trạng thái nếu cần
}

bool Dini_Parse_Telegram(const char* raw_str, DiniWeightData_t* out_data) {
    if (!raw_str || !out_data) return false;

    memset(out_data, 0, sizeof(DiniWeightData_t));

    // Định dạng Dini Argeo: "ST,GS,+  15.000,kg" hoặc "US,GS,+  14.500,kg"
    char status[4] = {0};
    char type[4] = {0};
    char weight_str[16] = {0};
    char unit_str[8] = {0};

    // Bóc tách nhanh chuỗi định dạng bằng sscanf
    int matched = sscanf(raw_str, "%2[^,],%2[^,],%15[^,],%7s", status, type, weight_str, unit_str);

    if (matched >= 3) {
        out_data->is_valid = true;
        out_data->is_stable = (strncmp(status, "ST", 2) == 0);

        // Chuyển đổi khối lượng sang số thực float
        out_data->gross_weight = strtof(weight_str, NULL);
        out_data->tare_weight = 0.0f;
        out_data->net_weight = out_data->gross_weight;

        strncpy(out_data->unit, unit_str[0] ? unit_str : "kg", sizeof(out_data->unit) - 1);
        return true;
    }

    return false;
}

int Dini_Format_JSON(const char* station_id, const DiniWeightData_t* data, char* json_buf, uint16_t max_len) {
    if (!station_id || !data || !json_buf) return 0;

    return snprintf(json_buf, max_len,
        "{\"station_id\":\"%s\",\"gross_weight\":%.3f,\"tare_weight\":%.3f,\"net_weight\":%.3f,\"is_stable\":%s,\"unit\":\"%s\"}",
        station_id,
        data->gross_weight,
        data->tare_weight,
        data->net_weight,
        data->is_stable ? "true" : "false",
        data->unit
    );
}
