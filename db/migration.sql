-- Cria tabela principal
create sequence URL_ID_SEQ;
create table urls (
	id int4 not null default nextval('URL_ID_SEQ'),
	original_url varchar(300) not null,
	shortened_url varchar(30) not null unique,
	constraint urls_pk primary key (id)	
);
CREATE UNIQUE INDEX urls_id_idx ON public.urls USING btree (id); 
