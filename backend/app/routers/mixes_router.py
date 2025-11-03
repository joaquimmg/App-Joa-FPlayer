
# CRUD de Mixes e Itens de Mix (rotas protegidas via JWT)

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import MixCreate, MixUpdate, MixOut, ItemCreate, ItemOut
from ..models import Mix, ItemMix
from ..auth import get_current_user

router = APIRouter(prefix="/mixes", tags=["Mixes"])

# LISTAR MIXES DO UTILIZADOR
@router.get("", response_model=List[MixOut])
def listar_mixes(db: Session = Depends(get_db), user=Depends(get_current_user)):
    mixes = db.query(Mix).filter(Mix.proprietario_id == user.id).all()
    return mixes

# CRIAR MIX
@router.post("", response_model=MixOut, status_code=201)
def criar_mix(body: MixCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    mix = Mix(
        nome=body.nome,
        flow_cor_base=body.flow_cor_base,
        proprietario_id=user.id
    )
    db.add(mix)
    db.commit()
    db.refresh(mix)
    return mix

# ATUALIZAR MIX
@router.put("/{mix_id}", response_model=MixOut)
def atualizar_mix(mix_id: int, body: MixUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    mix = db.query(Mix).filter(Mix.id == mix_id, Mix.proprietario_id == user.id).first()
    if not mix:
        raise HTTPException(status_code=404, detail="Mix não encontrado")
    mix.nome = body.nome
    mix.flow_cor_base = body.flow_cor_base
    db.commit()
    db.refresh(mix)
    return mix

# APAGAR MIX
@router.delete("/{mix_id}", status_code=204)
def apagar_mix(mix_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    mix = db.query(Mix).filter(Mix.id == mix_id, Mix.proprietario_id == user.id).first()
    if not mix:
        raise HTTPException(status_code=404, detail="Mix não encontrado")
    db.delete(mix)
    db.commit()
    return

# ADICIONAR ITEM AO MIX
@router.post("/{mix_id}/items", response_model=ItemOut, status_code=201)
def adicionar_item(mix_id: int, body: ItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    mix = db.query(Mix).filter(Mix.id == mix_id, Mix.proprietario_id == user.id).first()
    if not mix:
        raise HTTPException(status_code=404, detail="Mix não encontrado")
    item = ItemMix(mix_id=mix.id, media_titulo=body.media_titulo, media_tipo=body.media_tipo)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

# REMOVER ITEM DO MIX
@router.delete("/{mix_id}/items/{item_id}", status_code=204)
def remover_item(mix_id: int, item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = (
        db.query(ItemMix)
        .join(Mix, Mix.id == ItemMix.mix_id)
        .filter(ItemMix.id == item_id, Mix.id == mix_id, Mix.proprietario_id == user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    db.delete(item)
    db.commit()
    return
