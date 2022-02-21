create schema files_manager;
create user files_manager WITH PASSWORD 'password';

GRANT USAGE ON SCHEMA files_manager TO files_manager;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA files_manager TO files_manager;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA files_manager TO files_manager;


create schema white_rabbit;
create user white_rabbit WITH PASSWORD 'password';

GRANT USAGE ON SCHEMA white_rabbit TO white_rabbit;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA white_rabbit TO white_rabbit;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA white_rabbit TO white_rabbit;