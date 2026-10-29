--
-- PostgreSQL database dump
--

\restrict IJl9jpBPMgvCH2dy4WK5WCsTorzcAU3QeXDBX2lg7pcXQB8jKiQv7etYyfD6MXM

-- Dumped from database version 18.6 (Homebrew)
-- Dumped by pg_dump version 18.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP INDEX IF EXISTS public.idx_stations_process;
DROP INDEX IF EXISTS public.idx_product_stage;
DROP INDEX IF EXISTS public.idx_logs_time;
DROP INDEX IF EXISTS public.idx_logs_station;
DROP INDEX IF EXISTS public.idx_logs_process;
DROP INDEX IF EXISTS public.idx_logs_batch;
ALTER TABLE IF EXISTS ONLY public.station_weigh DROP CONSTRAINT IF EXISTS station_weigh_pkey;
ALTER TABLE IF EXISTS ONLY public.production_weight_logs DROP CONSTRAINT IF EXISTS production_weight_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.product DROP CONSTRAINT IF EXISTS product_pkey;
ALTER TABLE IF EXISTS ONLY public.process DROP CONSTRAINT IF EXISTS process_pkey;
ALTER TABLE IF EXISTS ONLY public.process_mapping DROP CONSTRAINT IF EXISTS process_mapping_pkey;
ALTER TABLE IF EXISTS ONLY public.batch DROP CONSTRAINT IF EXISTS batch_pkey;
DROP TABLE IF EXISTS public.station_weigh;
DROP TABLE IF EXISTS public.production_weight_logs;
DROP TABLE IF EXISTS public.product;
DROP TABLE IF EXISTS public.process_mapping;
DROP TABLE IF EXISTS public.process;
DROP TABLE IF EXISTS public.batch;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: batch; Type: TABLE; Schema: public; Owner: phanbach
--

CREATE TABLE public.batch (
    batch_id character varying(50) NOT NULL,
    batch_name character varying(100),
    status character varying(30) DEFAULT 'IN_PROGRESS'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.batch OWNER TO phanbach;

--
-- Name: process; Type: TABLE; Schema: public; Owner: phanbach
--

CREATE TABLE public.process (
    process_id character varying(50) NOT NULL,
    process_name character varying(255) NOT NULL,
    flow_title character varying(255),
    col_index integer DEFAULT 1 NOT NULL,
    row_index integer DEFAULT 1 NOT NULL,
    description text,
    color_bg character varying(20) DEFAULT '#FFFFFF'::character varying,
    color_border character varying(20) DEFAULT '#CBD5E1'::character varying,
    color_text character varying(20) DEFAULT '#1E293B'::character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.process OWNER TO phanbach;

--
-- Name: process_mapping; Type: TABLE; Schema: public; Owner: phanbach
--

CREATE TABLE public.process_mapping (
    mapping_id character varying(50) NOT NULL,
    from_process_id character varying(50) NOT NULL,
    to_process_id character varying(50) NOT NULL,
    transition_type character varying(30) DEFAULT 'DIRECT'::character varying NOT NULL,
    description character varying(255),
    order_index integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.process_mapping OWNER TO phanbach;

--
-- Name: product; Type: TABLE; Schema: public; Owner: phanbach
--

CREATE TABLE public.product (
    product_id character varying(50) NOT NULL,
    product_name character varying(100) NOT NULL,
    stage_id character varying(50) NOT NULL,
    type character varying(30) DEFAULT 'SEMI'::character varying,
    unit character varying(20) DEFAULT 'kg'::character varying,
    spec text,
    is_end boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product OWNER TO phanbach;

--
-- Name: production_weight_logs; Type: TABLE; Schema: public; Owner: phanbach
--

CREATE TABLE public.production_weight_logs (
    log_id bigint NOT NULL,
    batch_id character varying(50) NOT NULL,
    station_id character varying(50) NOT NULL,
    process_id character varying(50) NOT NULL,
    product_id character varying(50) NOT NULL,
    type_weight character varying(10) NOT NULL,
    value_weight numeric(12,3) NOT NULL,
    tare_weight numeric(12,3) NOT NULL,
    net_weight numeric(12,3) NOT NULL,
    time_action timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    employee_id character varying(50),
    source_method character varying(50),
    CONSTRAINT production_weight_logs_type_weight_check CHECK (((type_weight)::text = ANY ((ARRAY['IN'::character varying, 'OUT'::character varying])::text[])))
);


ALTER TABLE public.production_weight_logs OWNER TO phanbach;

--
-- Name: production_weight_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: phanbach
--

ALTER TABLE public.production_weight_logs ALTER COLUMN log_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.production_weight_logs_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: station_weigh; Type: TABLE; Schema: public; Owner: phanbach
--

CREATE TABLE public.station_weigh (
    station_id character varying(50) NOT NULL,
    station_name character varying(100) NOT NULL,
    process_id character varying(50) NOT NULL,
    io_type character varying(10) NOT NULL,
    hub_id character varying(100),
    indicator_model character varying(50) DEFAULT 'DINI_ARGEO'::character varying,
    model character varying(100) DEFAULT 'DINI ARGEO DFWL'::character varying,
    status character varying(20) DEFAULT 'ONLINE'::character varying,
    is_active boolean DEFAULT true,
    max_weight numeric(10,2) DEFAULT 150,
    division numeric(10,2) DEFAULT 10,
    protocol character varying(20) DEFAULT 'TCP/IP'::character varying,
    address character varying(100),
    location character varying(255),
    last_seen_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT station_weigh_io_type_check CHECK (((io_type)::text = ANY ((ARRAY['IN'::character varying, 'OUT'::character varying])::text[])))
);


ALTER TABLE public.station_weigh OWNER TO phanbach;

--
-- Data for Name: batch; Type: TABLE DATA; Schema: public; Owner: phanbach
--

INSERT INTO public.batch VALUES ('L0001', 'Lô tôm thẻ xuất khẩu Nhật Bản L0001', 'IN_PROGRESS', '2026-10-28 11:48:10.73745+07');
INSERT INTO public.batch VALUES ('L0002', 'Lô tôm chiên xù EU L0002', 'IN_PROGRESS', '2026-10-28 11:48:10.73745+07');
INSERT INTO public.batch VALUES ('L0003', 'Lô tôm luộc salad US L0003', 'IN_PROGRESS', '2026-10-28 11:48:10.73745+07');
INSERT INTO public.batch VALUES ('test', 'Lô kiểm định chất lượng', 'COMPLETED', '2026-10-28 11:48:10.73745+07');
INSERT INTO public.batch VALUES ('loconc', 'Lô tôm sú hữu cơ', 'COMPLETED', '2026-10-28 11:48:10.73745+07');


--
-- Data for Name: process; Type: TABLE DATA; Schema: public; Owner: phanbach
--

INSERT INTO public.process VALUES ('CD001', 'Tiếp nhận nguyên liệu', 'Material Receiving', 1, 1, 'Kiểm tra chất lượng và tiếp nhận tôm nguyên liệu đầu vào', '#FFEEDB', '#DCA365', '#4A2800', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD002', 'Rửa 1 & Phân cỡ sơ bộ', 'Grading & Sizing', 1, 2, 'Rửa sạch tạp chất và phân loại tôm theo kích cỡ tiêu chuẩn', '#FCE2E6', '#DF8F9B', '#4A0814', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD003', 'Xếp khuôn & Định lượng', 'Stacking & Batching', 1, 3, 'Xếp khuôn định hình và cân định lượng theo mẻ', '#F0E8F7', '#BFA0D8', '#3B0D59', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD004', 'Sơ chế (Bóc vỏ & Rút chỉ)', 'Peeling & Deveining', 1, 4, 'Bóc vỏ, vặt đầu hoặc rút chỉ lưng theo quy cách', '#E3F7E3', '#8EC68E', '#0E440E', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD005', 'Ngâm xử lý phụ gia', 'Soaking Process', 1, 5, 'Ngâm xử lý phụ gia theo quy chuẩn an toàn thực phẩm', '#FCE3DF', '#E89184', '#5C140A', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD006', 'Định hình Nobashi / Xẻ bướm', 'Nobashi & Butterfly', 1, 6, 'Định hình tôm duỗi thẳng Nobashi hoặc xẻ bướm', '#E9F1FC', '#9BBCE8', '#0B2F5C', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD007', 'Tẩm bột chiên xù', 'Breading Process', 1, 7, 'Tẩm bột Panko hoặc bột tẩm gia vị tiêu chuẩn', '#E4E8EF', '#8E9BB0', '#1A2634', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD008', 'Chiên định hình dầu nóng', 'Breaded Frying', 1, 8, 'Chiên định hình qua dầu nhiệt độ cao tạo độ giòn', '#DCF7F7', '#78D1D1', '#073B3B', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD009', 'Luộc / Hấp tôm nõn (PD)', 'PD Cooking', 2, 8, 'Gia nhiệt hấp hoặc luộc chín đối với tôm thịt PD', '#BDF0F0', '#5ECACA', '#073B3B', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD010', 'Luộc / Hấp tôm vỏ (HLSO)', 'HLSO Cooking', 3, 8, 'Gia nhiệt hấp hoặc luộc chín đối với tôm còn vỏ HLSO', '#BDF0F0', '#5ECACA', '#073B3B', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD011', 'Tách vỏ sau luộc', 'Peel After Cook', 3, 9, 'Bóc vỏ tôm sau khi luộc chín phục vụ chế biến salad', '#FDF8C7', '#DAC448', '#4D4004', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD012', 'Cấp đông xoắn tôm tươi', 'Raw Spiral Freezer', 1, 10, 'Cấp đông bằng băng chuyền xoắn sản phẩm tôm tươi', '#FFEEDB', '#DCA365', '#4A2800', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD013', 'Cấp đông xoắn tôm chiên', 'Fried Spiral Freezer', 2, 10, 'Cấp đông bằng băng chuyền xoắn sản phẩm tôm chiên', '#FFEEDB', '#DCA365', '#4A2800', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD014', 'Cấp đông IQF tôm tươi', 'Raw IQF Freezer', 3, 10, 'Cấp đông siêu tốc rời IQF và mạ băng tôm tươi', '#FFEEDB', '#DCA365', '#4A2800', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');
INSERT INTO public.process VALUES ('CD015', 'Cấp đông IQF tôm chín', 'Cooked IQF Freezer', 4, 10, 'Cấp đông siêu tốc rời IQF đối với sản phẩm tôm chín', '#FFEEDB', '#DCA365', '#4A2800', true, '2026-10-28 11:48:10.730064+07', '2026-10-28 11:48:10.730064+07');


--
-- Data for Name: process_mapping; Type: TABLE DATA; Schema: public; Owner: phanbach
--

INSERT INTO public.process_mapping VALUES ('MAP001', 'CD001', 'CD002', 'DIRECT', 'Tiếp nhận nguyên liệu -> Rửa 1 & Phân cỡ sơ bộ', 1, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP002', 'CD002', 'CD003', 'DIRECT', 'Rửa 1 & Phân cỡ sơ bộ -> Xếp khuôn & Định lượng', 2, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP003', 'CD003', 'CD004', 'DIRECT', 'Xếp khuôn & Định lượng -> Sơ chế (Bóc vỏ & Rút chỉ)', 3, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP004', 'CD003', 'CD005', 'BYPASS', 'Xếp khuôn & Định lượng -> Ngâm xử lý (Vượt cấp sơ chế)', 4, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP005', 'CD004', 'CD005', 'DIRECT', 'Sơ chế (Bóc vỏ & Rút chỉ) -> Ngâm xử lý phụ gia', 5, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP006', 'CD005', 'CD006', 'DIRECT', 'Ngâm xử lý phụ gia -> Định hình Nobashi / Xẻ bướm', 6, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP007', 'CD005', 'CD009', 'BRANCH', 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm nõn (PD)', 7, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP008', 'CD005', 'CD010', 'BRANCH', 'Ngâm xử lý phụ gia -> Luộc / Hấp tôm vỏ (HLSO)', 8, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP009', 'CD005', 'CD014', 'BRANCH', 'Ngâm xử lý phụ gia -> Cấp đông IQF tôm tươi', 9, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP010', 'CD006', 'CD007', 'DIRECT', 'Định hình Nobashi / Xẻ bướm -> Tẩm bột chiên xù', 10, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP011', 'CD007', 'CD008', 'DIRECT', 'Tẩm bột chiên xù -> Chiên định hình dầu nóng', 11, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP012', 'CD008', 'CD012', 'DIRECT', 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm tươi', 12, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP013', 'CD008', 'CD013', 'BRANCH', 'Chiên định hình dầu nóng -> Cấp đông xoắn tôm chiên', 13, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP014', 'CD009', 'CD013', 'DIRECT', 'Luộc / Hấp tôm nõn (PD) -> Cấp đông xoắn tôm chiên', 14, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP015', 'CD010', 'CD011', 'DIRECT', 'Luộc / Hấp tôm vỏ (HLSO) -> Tách vỏ sau luộc', 15, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP016', 'CD011', 'CD014', 'DIRECT', 'Tách vỏ sau luộc -> Cấp đông IQF tôm tươi', 16, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');
INSERT INTO public.process_mapping VALUES ('MAP017', 'CD011', 'CD015', 'BRANCH', 'Tách vỏ sau luộc -> Cấp đông IQF tôm chín', 17, true, '2026-10-28 11:48:10.735253+07', '2026-10-28 11:48:10.735253+07');


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: phanbach
--

INSERT INTO public.product VALUES ('TOM001', 'Tôm nguyên liệu tươi sống', 'CD001', 'SEMI', 'kg', 'Tôm thẻ chân trắng tươi sống nhập từ đầm nuôi', false, '2026-10-28 11:48:10.739211+07');
INSERT INTO public.product VALUES ('TP001', 'Tôm nguyên liệu loại 1', 'CD001', 'SEMI', 'kg', 'Tôm đạt chuẩn kích cỡ và độ tươi loại 1', false, '2026-10-28 11:48:10.741498+07');
INSERT INTO public.product VALUES ('TP002', 'Tôm nguyên liệu loại 2', 'CD001', 'SEMI', 'kg', 'Tôm đạt chuẩn loại 2 chuyển phân cỡ', false, '2026-10-28 11:48:10.742083+07');
INSERT INTO public.product VALUES ('TP003', 'Tôm dập gãy phân loại', 'CD001', 'BYPRODUCT', 'kg', 'Tôm dập gãy, đứt đầu chuyển phụ phẩm', false, '2026-10-28 11:48:10.742614+07');
INSERT INTO public.product VALUES ('SP-TN-01', 'Tôm nguyên liệu đạt chuẩn', 'CD001', 'SEMI', 'kg', 'Tôm tươi sống, nguyên con, ướp đá tỷ lệ 1:1', false, '2026-10-28 11:48:10.74311+07');
INSERT INTO public.product VALUES ('SP-PC-01', 'Tôm thẻ phân cỡ lớn (size 20-25)', 'CD002', 'SEMI', 'kg', 'Kích cỡ 20-25 con/kg, tôm loại 1', false, '2026-10-28 11:48:10.743612+07');
INSERT INTO public.product VALUES ('SP-PC-02', 'Tôm thẻ phân cỡ vừa (size 30-40)', 'CD002', 'SEMI', 'kg', 'Kích cỡ 30-40 con/kg, tôm loại 2', false, '2026-10-28 11:48:10.744117+07');
INSERT INTO public.product VALUES ('SP-XK-01', 'Mẻ tôm xếp khuôn 1.8kg', 'CD003', 'SEMI', 'kg', 'Khuôn inox tiêu chuẩn block 1.8kg net', false, '2026-10-28 11:48:10.7446+07');
INSERT INTO public.product VALUES ('SP-BV-01', 'Tôm bóc nõn rút chỉ (PD)', 'CD004', 'SEMI', 'kg', 'Bóc sạch vỏ, giữ lại đốt đuôi hoặc bóc nõn hoàn toàn', false, '2026-10-28 11:48:10.745057+07');
INSERT INTO public.product VALUES ('SP-PG-01', 'Bán thành phẩm sau ngâm phụ gia', 'CD005', 'SEMI', 'kg', 'Tăng trọng định mức 8-12%, thịt giòn ngọt tự nhiên', false, '2026-10-28 11:48:10.745526+07');
INSERT INTO public.product VALUES ('SP-DH-01', 'Tôm Nobashi kéo dài 13-14cm', 'CD006', 'SEMI', 'kg', 'Cắt gân bụng, ép duỗi thẳng', false, '2026-10-28 11:48:10.745955+07');
INSERT INTO public.product VALUES ('SP-TB-01', 'Tôm lăn bột xù trắng Panko', 'CD007', 'SEMI', 'kg', 'Bột ướt batter mix bám đều, áo bột xù', false, '2026-10-28 11:48:10.746394+07');
INSERT INTO public.product VALUES ('SP-CN-01', 'Tôm chiên chín sơ bộ', 'CD008', 'SEMI', 'kg', 'Chiên ngập dầu đậu nành 180 độ C trong 45 giây', false, '2026-10-28 11:48:10.746846+07');
INSERT INTO public.product VALUES ('SP-PD-01', 'Tôm thịt luộc chín PD', 'CD009', 'SEMI', 'kg', 'Luộc hấp nhiệt độ tâm sản phẩm đạt 85 độ C', false, '2026-10-28 11:48:10.747329+07');
INSERT INTO public.product VALUES ('SP-HL-01', 'Tôm vỏ luộc chín HLSO', 'CD010', 'SEMI', 'kg', 'Tôm bỏ đầu còn vỏ luộc chín giữ màu đỏ tươi', false, '2026-10-28 11:48:10.747749+07');
INSERT INTO public.product VALUES ('SP-TV-01', 'Tôm chín bóc vỏ Salad', 'CD011', 'SEMI', 'kg', 'Bóc vỏ tôm sau luộc làm salad ăn liền', false, '2026-10-28 11:48:10.748181+07');
INSERT INTO public.product VALUES ('SP-CX-01', 'Tôm đông xoắn tươi khay', 'CD012', 'FINISHED', 'kg', 'Đông nhiệt độ -40 độ C, đóng thùng carton xuất khẩu', true, '2026-10-28 11:48:10.748558+07');
INSERT INTO public.product VALUES ('SP-CC-01', 'Tôm chiên đông xoắn', 'CD013', 'FINISHED', 'kg', 'Cấp đông xoắn giữ độ giòn xốp bột chiên', true, '2026-10-28 11:48:10.749115+07');
INSERT INTO public.product VALUES ('SP-IQ-01', 'Tôm thẻ tươi IQF', 'CD014', 'FINISHED', 'kg', 'Cấp đông siêu tốc mạ băng 5% bảo vệ vỏ', true, '2026-10-28 11:48:10.74945+07');
INSERT INTO public.product VALUES ('SP-IC-01', 'Tôm chín đông IQF', 'CD015', 'FINISHED', 'kg', 'Đông rời từng con, tiện lợi rã đông sử dụng', true, '2026-10-28 11:48:10.749823+07');


--
-- Data for Name: production_weight_logs; Type: TABLE DATA; Schema: public; Owner: phanbach
--

INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (1, 'test', '10244156', 'CD001', 'TOM001', 'IN', 15.000, 1.000, 14.000, '2026-10-03 14:52:20.369+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (2, 'test', '10244156', 'CD001', 'TOM001', 'IN', 15.000, 1.000, 14.000, '2026-10-03 14:52:33.253+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (3, 'test', '10244156', 'CD001', 'TOM001', 'IN', 15.000, 1.000, 14.000, '2026-10-03 14:52:41.285+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (4, 'loconc', '10244156', 'CD001', 'TOM001', 'IN', 19.195, 1.120, 18.075, '2026-10-05 09:57:34.753+07', '123441', 'SIM_f7422');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (5, 'L0001', 'CAN001', 'CD001', 'TP001', 'IN', 25.500, 0.500, 25.000, '2026-10-05 17:20:30+07', 'NV001', 'TEST-PC-01');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (6, 'L0001', 'CAN001', 'CD001', 'TP001', 'IN', 25.500, 0.500, 25.000, '2026-10-05 17:20:30+07', 'NV003', 'TEST-PC-01');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (7, 'L0001', 'CAN002', 'CD001', 'TP001', 'IN', 25.500, 0.500, 25.000, '2026-10-05 17:20:30+07', 'NV003', 'TEST-PC-01');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (8, 'L0003', '7779460', 'CD001', 'TP002', 'IN', 6.013, 0.735, 5.278, '2026-10-05 19:05:03+07', 'NV003', '7779460-2');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (9, 'L0002', '7779460', 'CD001', 'TP002', 'IN', 32.374, 0.457, 31.917, '2026-10-05 19:05:09+07', 'NV003', '7779460-2');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (10, 'L0003', '7779460', 'CD001', 'TP002', 'IN', 31.244, 0.366, 30.878, '2026-10-05 19:05:12+07', 'NV002', '7779460-2');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (11, 'L0002', '7779460', 'CD001', 'TP002', 'IN', 30.496, 0.864, 29.632, '2026-10-05 19:05:16+07', 'NV002', '7779460-2');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (12, 'L0002', '7779460', 'CD001', 'TP003', 'IN', 49.966, 0.786, 49.180, '2026-10-05 19:05:27+07', 'NV002', '7779460-2');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (13, 'L0001', '10244161', 'CD006', 'SP-DH-01', 'OUT', 22.800, 0.800, 22.000, '2026-10-05 20:40:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (14, 'L0001', '10244167', 'CD012', 'SP-CX-01', 'OUT', 34.200, 1.200, 33.000, '2026-10-05 22:10:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (15, 'L0002', '10244163', 'CD008', 'SP-CN-01', 'OUT', 42.500, 1.500, 41.000, '2026-10-05 23:00:00+07', 'NV003', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (16, 'L0002', '10244168', 'CD013', 'SP-CC-01', 'OUT', 38.600, 1.200, 37.400, '2026-10-06 00:30:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (17, 'L0003', '10244170', 'CD015', 'SP-IC-01', 'OUT', 27.200, 1.000, 26.200, '2026-10-06 01:15:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (18, 'test', '10244167', 'CD012', 'SP-CX-01', 'OUT', 31.500, 1.500, 30.000, '2026-10-03 18:20:00+07', 'NV001', 'SIM_f7422');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (19, 'L0001', '10244157', 'CD002', 'SP-PC-01', 'IN', 48.500, 1.500, 47.000, '2026-10-05 18:00:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (20, 'L0001', '10244173', 'CD002', 'SP-PC-01', 'OUT', 46.200, 1.200, 45.000, '2026-10-05 18:30:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (21, 'L0001', '10244158', 'CD003', 'SP-XK-01', 'IN', 45.000, 1.000, 44.000, '2026-10-05 18:45:00+07', 'NV003', 'RS-232');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (22, 'L0001', '10244174', 'CD003', 'SP-XK-01', 'OUT', 44.000, 1.000, 43.000, '2026-10-05 19:15:00+07', 'NV003', 'RS-232');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (23, 'L0001', '10244159', 'CD004', 'SP-BV-01', 'IN', 43.000, 1.000, 42.000, '2026-10-05 19:30:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (24, 'L0001', '10244175', 'CD004', 'SP-BV-01', 'OUT', 34.500, 1.000, 33.500, '2026-10-05 20:15:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (25, 'L0001', '10244160', 'CD005', 'SP-PG-01', 'IN', 34.500, 1.500, 33.000, '2026-10-05 20:30:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (26, 'L0001', '10244176', 'CD005', 'SP-PG-01', 'OUT', 37.000, 1.500, 35.500, '2026-10-05 21:15:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (27, 'L0002', '10244162', 'CD007', 'SP-TB-01', 'IN', 31.000, 1.000, 30.000, '2026-10-05 21:45:00+07', 'NV003', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (28, 'L0002', '10244177', 'CD007', 'SP-TB-01', 'OUT', 43.500, 1.500, 42.000, '2026-10-05 22:30:00+07', 'NV003', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (29, 'L0003', '10244164', 'CD009', 'SP-PD-01', 'IN', 26.000, 1.000, 25.000, '2026-10-05 22:00:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (30, 'L0003', '10244178', 'CD009', 'SP-PD-01', 'OUT', 23.000, 1.000, 22.000, '2026-10-05 22:40:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (31, 'L0003', '10244165', 'CD010', 'SP-HL-01', 'IN', 29.000, 1.000, 28.000, '2026-10-05 23:00:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (32, 'L0003', '10244179', 'CD010', 'SP-HL-01', 'OUT', 27.200, 1.000, 26.200, '2026-10-05 23:45:00+07', 'NV002', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (33, 'L0003', '10244166', 'CD011', 'SP-TV-01', 'IN', 27.000, 1.000, 26.000, '2026-10-06 00:00:00+07', 'NV003', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (34, 'L0003', '10244180', 'CD011', 'SP-TV-01', 'OUT', 21.800, 1.000, 20.800, '2026-10-06 00:45:00+07', 'NV003', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (35, 'L0002', '10244169', 'CD014', 'SP-IQ-01', 'IN', 31.000, 1.000, 30.000, '2026-10-06 01:00:00+07', 'NV001', 'TCP/IP');
INSERT INTO public.production_weight_logs OVERRIDING SYSTEM VALUE VALUES (36, 'L0002', '10244181', 'CD014', 'SP-IQ-01', 'OUT', 30.600, 1.200, 29.400, '2026-10-06 01:40:00+07', 'NV001', 'TCP/IP');


--
-- Data for Name: station_weigh; Type: TABLE DATA; Schema: public; Owner: phanbach
--

INSERT INTO public.station_weigh VALUES ('10244156', 'Trạm cân Tiếp nhận 01', 'CD001', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.101:8000', 'Cửa nhập số 1 - Khu tiếp nhận tôm tươi', '2026-10-28 11:48:10.75025+07', '2026-10-28 11:48:10.75025+07');
INSERT INTO public.station_weigh VALUES ('CAN001', 'Trạm cân Tiếp nhận 01B', 'CD001', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'RS-232', 'COM2', 'Cửa nhập số 2 - Khu tiếp nhận tôm tươi', '2026-10-28 11:48:10.751699+07', '2026-10-28 11:48:10.751699+07');
INSERT INTO public.station_weigh VALUES ('CAN002', 'Trạm cân Tiếp nhận 02', 'CD001', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'RS-232', 'COM4', 'Cửa nhập số 3 - Khu tiếp nhận tôm tươi', '2026-10-28 11:48:10.752153+07', '2026-10-28 11:48:10.752153+07');
INSERT INTO public.station_weigh VALUES ('7779460', 'Trạm cân di động Tiếp nhận 03', 'CD001', 'IN', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'WiFi', '192.168.1.150:8000', 'Xe đẩy di động khu bốc dỡ', '2026-10-28 11:48:10.752582+07', '2026-10-28 11:48:10.752582+07');
INSERT INTO public.station_weigh VALUES ('10244157', 'Trạm cân Phân cỡ vào 02A', 'CD002', 'IN', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'TCP/IP', '192.168.1.102:8000', 'Băng chuyền vào phân cỡ 1', '2026-10-28 11:48:10.753005+07', '2026-10-28 11:48:10.753005+07');
INSERT INTO public.station_weigh VALUES ('10244173', 'Trạm cân Phân cỡ ra 02B', 'CD002', 'OUT', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'TCP/IP', '192.168.1.173:8000', 'Cửa ra băng chuyền phân cỡ 1', '2026-10-28 11:48:10.753428+07', '2026-10-28 11:48:10.753428+07');
INSERT INTO public.station_weigh VALUES ('10244158', 'Trạm cân Xếp khuôn vào 03A', 'CD003', 'IN', NULL, 'OHAUS_DEFENDER', 'OHAUS DEFENDER 3000', 'ONLINE', true, 30.00, 2.00, 'RS-232', 'COM3', 'Bàn tiếp nhận xếp khuôn khu A', '2026-10-28 11:48:10.753833+07', '2026-10-28 11:48:10.753833+07');
INSERT INTO public.station_weigh VALUES ('10244174', 'Trạm cân Xếp khuôn ra 03B', 'CD003', 'OUT', NULL, 'OHAUS_DEFENDER', 'OHAUS DEFENDER 3000', 'ONLINE', true, 30.00, 2.00, 'RS-232', 'COM5', 'Bàn chuyển mẻ xếp khuôn khu A', '2026-10-28 11:48:10.754254+07', '2026-10-28 11:48:10.754254+07');
INSERT INTO public.station_weigh VALUES ('10244159', 'Trạm cân Bóc vỏ vào 04A', 'CD004', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 30.00, 2.00, 'TCP/IP', '192.168.1.104:8000', 'Đầu chuyền bóc vỏ số 2', '2026-10-28 11:48:10.754661+07', '2026-10-28 11:48:10.754661+07');
INSERT INTO public.station_weigh VALUES ('10244175', 'Trạm cân Bóc vỏ ra 04B', 'CD004', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 30.00, 2.00, 'TCP/IP', '192.168.1.175:8000', 'Cuối chuyền bóc vỏ số 2', '2026-10-28 11:48:10.755076+07', '2026-10-28 11:48:10.755076+07');
INSERT INTO public.station_weigh VALUES ('10244160', 'Trạm cân Bồn ngâm vào 05A', 'CD005', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 300.00, 20.00, 'TCP/IP', '192.168.1.105:8000', 'Khu vực cấp liệu bồn ngâm số 3', '2026-10-28 11:48:10.755467+07', '2026-10-28 11:48:10.755467+07');
INSERT INTO public.station_weigh VALUES ('10244176', 'Trạm cân Bồn ngâm ra 05B', 'CD005', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 300.00, 20.00, 'TCP/IP', '192.168.1.176:8000', 'Cửa xả bán thành phẩm bồn ngâm số 3', '2026-10-28 11:48:10.755777+07', '2026-10-28 11:48:10.755777+07');
INSERT INTO public.station_weigh VALUES ('10244161', 'Trạm cân Định hình Nobashi 06', 'CD006', 'OUT', NULL, 'OHAUS_DEFENDER', 'OHAUS DEFENDER 3000', 'ONLINE', true, 30.00, 2.00, 'TCP/IP', '192.168.1.106:8000', 'Bàn ép định hình khay 25 con', '2026-10-28 11:48:10.756081+07', '2026-10-28 11:48:10.756081+07');
INSERT INTO public.station_weigh VALUES ('10244162', 'Trạm cân Tẩm bột vào 07A', 'CD007', 'IN', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'TCP/IP', '192.168.1.107:8000', 'Đầu chuyền tẩm bột xù Panko', '2026-10-28 11:48:10.756405+07', '2026-10-28 11:48:10.756405+07');
INSERT INTO public.station_weigh VALUES ('10244177', 'Trạm cân Tẩm bột ra 07B', 'CD007', 'OUT', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'TCP/IP', '192.168.1.177:8000', 'Cuối chuyền tẩm bột xù Panko', '2026-10-28 11:48:10.756712+07', '2026-10-28 11:48:10.756712+07');
INSERT INTO public.station_weigh VALUES ('10244163', 'Trạm cân Chiên chín 08', 'CD008', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.108:8000', 'Cửa ra lò chiên liên tục', '2026-10-28 11:48:10.757062+07', '2026-10-28 11:48:10.757062+07');
INSERT INTO public.station_weigh VALUES ('10244164', 'Trạm cân Nấu tôm PD vào 09A', 'CD009', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.109:8000', 'Nồi luộc áp suất số 1 (Vào)', '2026-10-28 11:48:10.75747+07', '2026-10-28 11:48:10.75747+07');
INSERT INTO public.station_weigh VALUES ('10244178', 'Trạm cân Nấu tôm PD ra 09B', 'CD009', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.178:8000', 'Cửa ra rổ nõn luộc số 1', '2026-10-28 11:48:10.757795+07', '2026-10-28 11:48:10.757795+07');
INSERT INTO public.station_weigh VALUES ('10244165', 'Trạm cân Nấu tôm HLSO vào 10A', 'CD010', 'IN', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.110:8000', 'Nồi luộc nhiệt độ chuẩn 2 (Vào)', '2026-10-28 11:48:10.758242+07', '2026-10-28 11:48:10.758242+07');
INSERT INTO public.station_weigh VALUES ('10244179', 'Trạm cân Nấu tôm HLSO ra 10B', 'CD010', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.179:8000', 'Cửa làm nguội sau luộc HLSO 2', '2026-10-28 11:48:10.75859+07', '2026-10-28 11:48:10.75859+07');
INSERT INTO public.station_weigh VALUES ('10244166', 'Trạm cân Tách vỏ vào 11A', 'CD011', 'IN', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'TCP/IP', '192.168.1.111:8000', 'Chuyền cấp tôm chín tách vỏ', '2026-10-28 11:48:10.758933+07', '2026-10-28 11:48:10.758933+07');
INSERT INTO public.station_weigh VALUES ('10244180', 'Trạm cân Tách vỏ ra 11B', 'CD011', 'OUT', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 60.00, 5.00, 'TCP/IP', '192.168.1.180:8000', 'Chuyền bóc nõn chín salad (Ra)', '2026-10-28 11:48:10.759262+07', '2026-10-28 11:48:10.759262+07');
INSERT INTO public.station_weigh VALUES ('10244167', 'Trạm cân Cấp đông xoắn tươi 12', 'CD012', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 300.00, 20.00, 'TCP/IP', '192.168.1.112:8000', 'Băng xoắn đông tươi số 1', '2026-10-28 11:48:10.759617+07', '2026-10-28 11:48:10.759617+07');
INSERT INTO public.station_weigh VALUES ('10244168', 'Trạm cân Cấp đông xoắn chiên 13', 'CD013', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 300.00, 20.00, 'TCP/IP', '192.168.1.113:8000', 'Băng xoắn đông chiên số 2', '2026-10-28 11:48:10.759939+07', '2026-10-28 11:48:10.759939+07');
INSERT INTO public.station_weigh VALUES ('10244169', 'Trạm cân Cấp đông IQF tươi vào 14A', 'CD014', 'IN', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.114:8000', 'Cửa nạp băng chuyền IQF tươi', '2026-10-28 11:48:10.760489+07', '2026-10-28 11:48:10.760489+07');
INSERT INTO public.station_weigh VALUES ('10244181', 'Trạm cân Cấp đông IQF tươi ra 14B', 'CD014', 'OUT', NULL, 'METTLER_TOLEDO', 'METTLER TOLEDO IND231', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.181:8000', 'Cửa ra mạ băng chuyền IQF tươi', '2026-10-28 11:48:10.760805+07', '2026-10-28 11:48:10.760805+07');
INSERT INTO public.station_weigh VALUES ('10244170', 'Trạm cân Cấp đông IQF chín 15', 'CD015', 'OUT', NULL, 'DINI_ARGEO', 'DINI ARGEO DFWL', 'ONLINE', true, 150.00, 10.00, 'TCP/IP', '192.168.1.115:8000', 'Cửa ra băng chuyền IQF chín', '2026-10-28 11:48:10.761113+07', '2026-10-28 11:48:10.761113+07');


--
-- Name: production_weight_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: phanbach
--

SELECT pg_catalog.setval('public.production_weight_logs_log_id_seq', 37, true);


--
-- Name: batch batch_pkey; Type: CONSTRAINT; Schema: public; Owner: phanbach
--

ALTER TABLE ONLY public.batch
    ADD CONSTRAINT batch_pkey PRIMARY KEY (batch_id);


--
-- Name: process_mapping process_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: phanbach
--

ALTER TABLE ONLY public.process_mapping
    ADD CONSTRAINT process_mapping_pkey PRIMARY KEY (mapping_id);


--
-- Name: process process_pkey; Type: CONSTRAINT; Schema: public; Owner: phanbach
--

ALTER TABLE ONLY public.process
    ADD CONSTRAINT process_pkey PRIMARY KEY (process_id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: phanbach
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (product_id);


--
-- Name: production_weight_logs production_weight_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: phanbach
--

ALTER TABLE ONLY public.production_weight_logs
    ADD CONSTRAINT production_weight_logs_pkey PRIMARY KEY (log_id);


--
-- Name: station_weigh station_weigh_pkey; Type: CONSTRAINT; Schema: public; Owner: phanbach
--

ALTER TABLE ONLY public.station_weigh
    ADD CONSTRAINT station_weigh_pkey PRIMARY KEY (station_id);


--
-- Name: idx_logs_batch; Type: INDEX; Schema: public; Owner: phanbach
--

CREATE INDEX idx_logs_batch ON public.production_weight_logs USING btree (batch_id);


--
-- Name: idx_logs_process; Type: INDEX; Schema: public; Owner: phanbach
--

CREATE INDEX idx_logs_process ON public.production_weight_logs USING btree (process_id);


--
-- Name: idx_logs_station; Type: INDEX; Schema: public; Owner: phanbach
--

CREATE INDEX idx_logs_station ON public.production_weight_logs USING btree (station_id);


--
-- Name: idx_logs_time; Type: INDEX; Schema: public; Owner: phanbach
--

CREATE INDEX idx_logs_time ON public.production_weight_logs USING btree (time_action);


--
-- Name: idx_product_stage; Type: INDEX; Schema: public; Owner: phanbach
--

CREATE INDEX idx_product_stage ON public.product USING btree (stage_id);


--
-- Name: idx_stations_process; Type: INDEX; Schema: public; Owner: phanbach
--

CREATE INDEX idx_stations_process ON public.station_weigh USING btree (process_id);


--
-- PostgreSQL database dump complete
--

\unrestrict IJl9jpBPMgvCH2dy4WK5WCsTorzcAU3QeXDBX2lg7pcXQB8jKiQv7etYyfD6MXM

