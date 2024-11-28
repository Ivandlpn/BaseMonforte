from flask import Flask, request, render_template
from data_processing import load_and_clean_data, find_closest_door

app = Flask(__name__)

# Cargar y procesar los datos del archivo Excel
EXCEL_FILE = "puertas.xlsx"
data = load_and_clean_data(EXCEL_FILE)

@app.route('/')
def home():
    """
    Página principal con el formulario de entrada.
    """
    return render_template('index.html')

@app.route('/closest-door', methods=['POST'])
def get_closest_door_form():
    """
    Procesar la entrada del formulario y devolver los resultados.
    """
    try:
        # Obtener el punto kilométrico ingresado por el usuario
        user_km = float(request.form['km'])

        # Encontrar la puerta más cercana
        closest_door = find_closest_door(data, user_km)

        return render_template(
            'result.html',
            user_km=user_km,
            closest_door=closest_door
        )
    except Exception as e:
        # Manejar errores
        return render_template('error.html', message=str(e))

if __name__ == '__main__':
    app.run(debug=True)
