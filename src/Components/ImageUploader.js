import React, { useState } from 'react';
import '../css/imageUploader.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


const labels = {
    0: "annual_crop",
    1: "forest",
    2: "herbaceous_vegetation",
    3: "highway",
    4: "industrial_building",
    5: "pasture",
    6: "permanent_crop",
    7: "residential_building",
    8: "river",
    9: "sea_lake"
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const ConfidenceHistogram = ({ confidences }) => {
    const data = {
        labels: confidences.map((_, index) => labels[index]),
        datasets: [
            {
                label: 'Confidence',
                data: confidences,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: 'Confidence Levels',
                font: {
                    size: 18,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    callback: function (value) {
                        return labels[value];
                    },
                    maxRotation: 90,
                    minRotation: 90,
                },
            },
            y: {
                beginAtZero: true,
                max: 1,
                title: {
                    display: true,
                    text: 'Confidence',
                    font: {
                        size: 14,
                    },
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

const ImageUploader = () => {
    const [image, setImage] = useState(null);
    const [prediction, setPrediction] = useState(null);

    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = 64;
                canvas.height = 64;
                ctx.drawImage(img, 0, 0, 64, 64);
                canvas.toBlob(resolve, 'image/png');
            };

            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const resizedImage = await resizeImage(file);
        setImage(URL.createObjectURL(resizedImage));

        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) {
            console.error('Failed to upload image');
            return;
        }

        const data = await res.json();
        setPrediction(data);
    };

    return (
        <div className="container">
            <h1 className="title">EuroSat Predictions</h1>
            <input
                className="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {image && (
                <div className="preview-container">
                    <div className="row">
                        <div className="image">
                            <h3>Image (64x64)</h3>
                            <img className="preview-image" src={image} alt="Resized Preview" />
                        </div>
                        {prediction && (
                            <div className='prediction'>
                                {prediction.class}
                            </div>
                        )}
                    </div>

                    {prediction && (
                        <div className="row">
                            <ConfidenceHistogram className='histogram' confidences={prediction.confidences} />
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default ImageUploader;
