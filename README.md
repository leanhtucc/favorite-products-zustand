## Nhận xét Zustand so với Redux Toolkit

Em lựa chọn Zustand để xây dựng chức năng sản phẩm yêu thích vì
cách tổ chức store đơn giản và ít boilerplate hơn Redux Toolkit.
State và các action thêm, xóa hoặc toggle sản phẩm có thể đặt chung
trong một store mà không cần khai báo slice hay dispatch action.
Zustand cũng không cần Provider và component có thể subscribe trực
tiếp vào phần state cần sử dụng. Tuy nhiên, Redux Toolkit có cấu
trúc chuẩn hóa hơn, hỗ trợ DevTools, middleware và xử lý bất đồng bộ
tốt hơn đối với những dự án có state lớn và phức tạp. Với tính năng
Favorites nhỏ và độc lập trong bài này, Zustand là lựa chọn gọn và
phù hợp hơn.