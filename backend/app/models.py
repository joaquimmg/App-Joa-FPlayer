
# Modelos das tabelas: User, Mix, ItemMix.

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    mixes = relationship("Mix", back_populates="proprietario", cascade="all, delete")

class Mix(Base):
    __tablename__ = "mixes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    flow_cor_base = Column(String, nullable=False)
    proprietario_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    proprietario = relationship("User", back_populates="mixes")
    items = relationship("ItemMix", back_populates="mix", cascade="all, delete")

class ItemMix(Base):
    __tablename__ = "itens_mix"

    id = Column(Integer, primary_key=True, index=True)
    mix_id = Column(Integer, ForeignKey("mixes.id"), nullable=False)
    media_titulo = Column(String, nullable=False)  # Apenas o título (sem URI local)
    media_tipo = Column(String, nullable=False)    # 'audio' ou 'video'

    mix = relationship("Mix", back_populates="items")
