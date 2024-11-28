import pandas as pd

def load_and_clean_data(file_path):
    """
    Carga y limpia el archivo Excel.
    """
    # Carga el archivo
    data = pd.read_excel(file_path)

    # Selecciona las columnas importantes
    data = data[["Via", "Pk Inicial"]].copy()

    # Convierte 'Pk Inicial' a numérico
    data['Pk Inicial'] = pd.to_numeric(data['Pk Inicial'], errors='coerce')

    # Filtra filas válidas
    data = data.dropna(subset=['Pk Inicial'])

    return data

def find_closest_door(data, user_km):
    """
    Encuentra la puerta más cercana al punto kilométrico ingresado.
    """
    data['Distance'] = abs(data['Pk Inicial'] - user_km)
    closest_door = data.loc[data['Distance'].idxmin()]
    return closest_door.to_dict()
