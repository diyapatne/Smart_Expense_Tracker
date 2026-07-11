# from logging.config import fileConfig

# from sqlalchemy import engine_from_config
# from sqlalchemy import pool

# from alembic import context
# from dotenv import load_dotenv
# import os
# # this is the Alembic Config object, which provides
# # access to the values within the .ini file in use.
# config = context.config
# from pathlib import Path

# load_dotenv(Path(__file__).resolve().parents[1] / ".env")
# database_url = os.getenv("DATABASE_URL")
# config.set_main_option("sqlalchemy.url", database_url)

# # Interpret the config file for Python logging.
# # This line sets up loggers basically.
# if config.config_file_name is not None:
#     fileConfig(config.config_file_name)

# # add your model's MetaData object here
# # for 'autogenerate' support
# # from myapp import mymodel
# # target_metadata = mymodel.Base.metadata

# import sys
# import os

# sys.path.append(
#     os.path.dirname(
#         os.path.dirname(
#             os.path.abspath(__file__)
#         )
#     )
# )

# from database import Base
# import models

# target_metadata = Base.metadata

# # other values from the config, defined by the needs of env.py,
# # can be acquired:
# # my_important_option = config.get_main_option("my_important_option")
# # ... etc.


# def run_migrations_offline() -> None:
#     """Run migrations in 'offline' mode.

#     This configures the context with just a URL
#     and not an Engine, though an Engine is acceptable
#     here as well.  By skipping the Engine creation
#     we don't even need a DBAPI to be available.

#     Calls to context.execute() here emit the given string to the
#     script output.

#     """
#     url = config.get_main_option("sqlalchemy.url")
#     context.configure(
#         url=url,
#         target_metadata=target_metadata,
#         literal_binds=True,
#         dialect_opts={"paramstyle": "named"},
#     )

#     with context.begin_transaction():
#         context.run_migrations()


# def run_migrations_online() -> None:
#     """Run migrations in 'online' mode.

#     In this scenario we need to create an Engine
#     and associate a connection with the context.

#     """
#     from sqlalchemy import create_engine

#     connectable = create_engine(
#     database_url,
#     pool_pre_ping=True,
#     pool_recycle=300,
# )

#     with connectable.connect() as connection:
#         context.configure(
#             connection=connection, target_metadata=target_metadata
#         )

#         with context.begin_transaction():
#             context.run_migrations()

# # 
# if context.is_offline_mode():
#     run_migrations_offline()
# else:
#     run_migrations_online()














from logging.config import fileConfig
from pathlib import Path
import os
import sys

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool

# --------------------------------------------------
# Load .env
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL not found in .env")

# --------------------------------------------------
# Alembic Config
# --------------------------------------------------

config = context.config
config.set_main_option("sqlalchemy.url", database_url)

# --------------------------------------------------
# Logging
# --------------------------------------------------

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --------------------------------------------------
# Import models
# --------------------------------------------------

sys.path.append(str(BASE_DIR))

from database import Base
import models

target_metadata = Base.metadata

# --------------------------------------------------
# Debug (password hidden)
# --------------------------------------------------

# safe_url = database_url

# if "@" in safe_url and ":" in safe_url:
#     prefix, suffix = safe_url.split("@", 1)
#     if ":" in prefix:
#         user = prefix.split(":")[0]
#         safe_url = f"{user}:***@{suffix}"

# print("=" * 60)
# print("Alembic Database URL")
# print(safe_url)
# print("=" * 60)


# --------------------------------------------------
# Offline migrations
# --------------------------------------------------

def run_migrations_offline():

    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# --------------------------------------------------
# Online migrations
# --------------------------------------------------

def run_migrations_online():

    connectable = create_engine(
        database_url,
        poolclass=pool.NullPool,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={
            "connect_timeout": 30
        }
    )

    with connectable.connect() as connection:

        print("Connected successfully to database.")

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# --------------------------------------------------
# Run
# --------------------------------------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()